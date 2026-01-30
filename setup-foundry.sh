#!/bin/bash

# Foundry Setup Script
# This script installs Foundry (Forge, Cast, Anvil, and Chisel) on your system
# For more information, visit: https://book.getfoundry.sh/

set -e

echo "🔧 Setting up Foundry for Ethereum development..."
echo ""

# Check if foundry is already installed
if command -v forge &> /dev/null; then
    echo "✅ Foundry is already installed!"
    echo "Current version:"
    forge --version
    echo ""
    read -p "Do you want to update Foundry? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Updating Foundry..."
        foundryup
        echo "✅ Foundry updated successfully!"
    else
        echo "Skipping update."
    fi
else
    echo "📦 Installing Foundry..."
    echo "This will download and install Foundry using the official installer."
    echo ""
    
    # Download and install Foundry
    curl -L https://foundry.paradigm.xyz | bash
    
    echo ""
    echo "⚙️  Setting up Foundry in your PATH..."
    
    # Source the foundry environment
    export PATH="$HOME/.foundry/bin:$PATH"
    
    # Run foundryup to install the latest versions
    if command -v foundryup &> /dev/null; then
        foundryup
    else
        echo "⚠️  Please restart your terminal and run 'foundryup' to complete the installation."
        echo "Or run: source ~/.bashrc (or ~/.zshrc) and then 'foundryup'"
        exit 0
    fi
    
    echo ""
    echo "✅ Foundry installed successfully!"
fi

echo ""
echo "📋 Installed components:"
forge --version 2>/dev/null || echo "  forge - ⚠️  not found in PATH"
cast --version 2>/dev/null || echo "  cast - ⚠️  not found in PATH"
anvil --version 2>/dev/null || echo "  anvil - ⚠️  not found in PATH"
chisel --version 2>/dev/null || echo "  chisel - ⚠️  not found in PATH"

echo ""
echo "🎉 Foundry setup complete!"
echo ""
echo "Next steps:"
echo "1. If this is a fresh install, restart your terminal or run:"
echo "   source ~/.bashrc  (or ~/.zshrc)"
echo "2. Verify installation: forge --version"
echo "3. Initialize a Foundry project: forge init my-project"
echo "4. Check out the examples in the 'examples/' directory"
echo ""
echo "📚 Documentation: https://book.getfoundry.sh/"
