# How to Edit Your SSH Config File

## The Problem
Your SSH config file exists but has restricted permissions that prevent automatic editing.

## Solution: Manual Edit

### Step 1: Open the SSH Config File

**Option A: Using File Explorer**
1. Press `Win + R` to open Run dialog
2. Type: `%USERPROFILE%\.ssh` and press Enter
3. Right-click on `config` file (if it doesn't exist, create a new text file and name it `config`)
4. Select "Open with" → "Notepad"

**Option B: Using PowerShell (Run as Administrator)**
1. Right-click on PowerShell icon
2. Select "Run as Administrator"
3. Run: `notepad $env:USERPROFILE\.ssh\config`

**Option C: Direct Path**
Open Notepad and paste this path in the address bar:
```
C:\Users\abhin\.ssh\config
```

### Step 2: Add This Content

If the file is empty or doesn't have the `ammas-vm` entry, add this:

```
Host ammas-vm
    HostName 172.171.241.8
    User azureuser
    IdentityFile C:\Users\abhin\Downloads\ammas-food_key.pem
    StrictHostKeyChecking no
```

### Step 3: Save the File

Press `Ctrl + S` to save.

### Step 4: Fix PEM File Permissions

In PowerShell (Run as Administrator), run:
```powershell
icacls "C:\Users\abhin\Downloads\ammas-food_key.pem" /inheritance:r
icacls "C:\Users\abhin\Downloads\ammas-food_key.pem" /grant "${env:USERNAME}:(R)"
```

### Step 5: Test Connection

Now you should be able to connect with:
```bash
ssh ammas-vm
```

---

## Alternative: Use Direct SSH Command (No Config Needed)

If the config file keeps giving you trouble, you can connect directly:

```bash
ssh -i "C:\Users\abhin\Downloads\ammas-food_key.pem" azureuser@172.171.241.8
```

In Git Bash, use:
```bash
ssh -i /c/Users/abhin/Downloads/ammas-food_key.pem azureuser@172.171.241.8
```
