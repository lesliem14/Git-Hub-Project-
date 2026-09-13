# Two pages — how the site is meant to work

| | Page 1 | Page 2 |
|---|--------|--------|
| **Name** | AI Agent Guide | Development Site / IDE |
| **URL** | `/` or `/index.html` | `/open/` |
| **File** | `index.html` | `open/index.html` |

## Page 1 — AI Agent Guide (opens first)

- Contact link  
- **Development Site → Click Here** (goes to page 2)  
- Site URL (masked label)  
- **SOLIDITY** panel with ExampleContract source + Copy  
- Full text guide + mobile notes  
- Optional download zips  

## Page 2 — IDE compiler (Development Site)

Opened only via **Development Site** links or by visiting `/open/` directly.

- File Explorer (new file / folder, `contracts/*.sol`)  
- Solidity Compiler tab  
- **Deploy & Run Transactions** on the **left** sidebar  
- Secure Deploy, Copy Address, terminal, CodeMirror editor  

## Deploy requirement

Upload **`idecompiler-install.zip`** so both `index.html` and the `open/` folder exist on the same host. The small 9-file zip does **not** include the full page 2 IDE.

## Config

`site-config.js` → `IDE_PAGE_URL = "/open/"` wires page 1 links to page 2.
