# Kubernetes (enterprise default)

Large corporates usually run batch integrations on a **shared Kubernetes platform** (most often **Azure Kubernetes Service (AKS)** in Microsoft-centric insurance/finance, or **EKS / OpenShift** elsewhere). The standard pattern is a **CronJob** per schedule, secrets from a vault, and **persistent volumes** for SQLite and the Excel queue.

This matches how platform teams already run other hourly ETL and compliance jobs.

## Prerequisites

- Container registry (ACR, ECR, Harbor, etc.) with the image built from `sentiment-sweep/Dockerfile`
- Storage class that supports **ReadWriteMany** for the output PVC (e.g. Azure Files on AKS) so multiple pods or sync agents can read the share
- Secret store integration (Azure Key Vault + Secrets Store CSI, External Secrets Operator, etc.) instead of plain `kubectl apply` secrets where possible

## Deploy

1. Build and push the image:

```bash
cd sentiment-sweep
docker build -t YOUR_REGISTRY/sentiment-sweep:1.0.0 .
docker push YOUR_REGISTRY/sentiment-sweep:1.0.0
```

2. Replace `YOUR_REGISTRY/sentiment-sweep:latest` in the CronJob manifests with your tag.

3. Apply manifests (order matters for PVCs and secrets):

```bash
kubectl apply -f namespace.yaml
kubectl apply -f pvc.yaml
# Prefer Key Vault / ESO; for bootstrap only:
kubectl apply -f secret.yaml   # from secret.example.yaml
kubectl apply -f cronjob-sweep.yaml
kubectl apply -f cronjob-report.yaml
```

4. Confirm:

```bash
kubectl -n sentiment-sweep get cronjob
kubectl -n sentiment-sweep create job --from=cronjob/sentiment-sweep-hourly manual-test-1
kubectl -n sentiment-sweep logs job/manual-test-1
```

## AKS + SharePoint-style output (typical enterprise)

- Mount **`sentiment-sweep-output`** on **Azure Files** (ReadWriteMany).
- Use **Azure File Sync**, **SharePoint document library sync**, or a controlled **SFTP/Logic App** bridge so only the complaints team sees `social_sweep_LATEST.xlsx`.
- Store API keys in **Azure Key Vault**; map into the pod via **Secrets Store CSI Driver**.

## Why not Docker Compose / cron on a VM?

| Approach | Typical use |
|----------|-------------|
| **K8s CronJob (this folder)** | Enterprise production — central ops, RBAC, vault secrets, HA storage |
| Docker Compose + supercronic | Dev, POC, or small team without a cluster |
| systemd / cron on Linux VM | Legacy datacenter without containers |
| Windows Task Scheduler | Older Windows-only estates (still common; use venv + `main.py sweep`) |

## POPIA

- Restrict namespace RBAC to the platform + complaints automation SAs.
- Encrypt PVCs at rest (cloud default + CMK if required).
- Do not log raw PII; alerts are already masked in application code.
