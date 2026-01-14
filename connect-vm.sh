#!/bin/bash
# Bash script to connect to Azure VM
# Usage: ./connect-vm.sh <VM_IP> <PEM_FILE> [username]

VM_IP=${1:-""}
PEM_FILE=${2:-""}
USERNAME=${3:-"azureuser"}

if [ -z "$VM_IP" ] || [ -z "$PEM_FILE" ]; then
    echo "Usage: ./connect-vm.sh <VM_IP> <PEM_FILE> [username]"
    echo "Example: ./connect-vm.sh 20.123.45.67 ~/.ssh/my-key.pem azureuser"
    exit 1
fi

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo "Error: PEM file not found: $PEM_FILE"
    exit 1
fi

# Set permissions
chmod 400 "$PEM_FILE"

# Connect
echo "Connecting to $USERNAME@$VM_IP..."
ssh -i "$PEM_FILE" "$USERNAME@$VM_IP"
