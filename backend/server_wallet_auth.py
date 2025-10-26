"""
Municipal Fund Blockchain System - Wallet-Based Authentication
Backend configuration for role-based wallet access
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from web3 import Web3
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Blockchain connection
RPC_URL = os.getenv('RPC_URL', 'http://127.0.0.1:8545')
w3 = Web3(Web3.HTTPProvider(RPC_URL))

# ========================================
# WALLET-BASED ROLE CONFIGURATION
# ========================================
# Each wallet address is mapped to a specific role
# Uses Hardhat's default test accounts for localhost development

ROLE_ADDRESSES = {
    # ADMIN - System Administrator
    '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266': {
        'role': 'admin',
        'name': 'System Administrator',
        'permissions': [
            'create_project',
            'allocate_funds',
            'manage_system',
            'view_all_projects',
            'manage_users'
        ]
    },
    
    # SUPERVISOR - Project Supervisor
    '0x70997970c51812dc3a010c7d01b50e0d17dc79c8': {
        'role': 'supervisor',
        'name': 'Project Supervisor',
        'permissions': [
            'approve_tender',
            'verify_milestone',
            'view_projects',
            'review_contractors'
        ]
    },
    
    # CONTRACTOR 1
    '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc': {
        'role': 'contractor',
        'name': 'Contractor A',
        'permissions': [
            'submit_tender',
            'complete_milestone',
            'view_own_projects',
            'receive_payments'
        ]
    },
    
    # CONTRACTOR 2
    '0x90f79bf6eb2c4f870365e785982e1f101e93b906': {
        'role': 'contractor',
        'name': 'Contractor B',
        'permissions': [
            'submit_tender',
            'complete_milestone',
            'view_own_projects',
            'receive_payments'
        ]
    },
    
    # CITIZEN - Public Access
    '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65': {
        'role': 'citizen',
        'name': 'Public Citizen',
        'permissions': [
            'view_public_info',
            'view_transparency_reports'
        ]
    }
}

# Legacy username/password authentication (optional backup)
LEGACY_USERS = {
    'admin': {
        'password': 'admin123',
        'role': 'admin',
        'address': '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
    },
    'supervisor': {
        'password': 'super123',
        'role': 'supervisor',
        'address': '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
    }
}

# ========================================
# AUTHENTICATION ENDPOINTS
# ========================================

@app.route('/api/auth/wallet', methods=['POST'])
def authenticate_wallet():
    """
    Authenticate user based on wallet address
    Returns user info with role and permissions
    """
    try:
        data = request.json
        address = data.get('address', '').lower()
        
        if not address:
            return jsonify({'success': False, 'message': 'Address is required'}), 400
        
        # Validate ethereum address format
        if not Web3.is_address(address):
            return jsonify({'success': False, 'message': 'Invalid Ethereum address'}), 400
        
        # Normalize address to checksum format
        checksum_address = Web3.to_checksum_address(address)
        
        # Check if address is in role mapping
        role_info = ROLE_ADDRESSES.get(address)
        
        if role_info:
            # Known wallet with specific role
            return jsonify({
                'success': True,
                'user': {
                    'address': checksum_address,
                    'role': role_info['role'],
                    'name': role_info['name'],
                    'permissions': role_info['permissions']
                }
            })
        else:
            # Unknown wallet - default to contractor role
            return jsonify({
                'success': True,
                'user': {
                    'address': checksum_address,
                    'role': 'contractor',
                    'name': 'Guest Contractor',
                    'permissions': ['submit_tender', 'view_own_projects']
                },
                'message': 'Address not registered. Assigned default contractor role.'
            })
            
    except Exception as e:
        print(f"Error in wallet authentication: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def legacy_login():
    """
    Legacy username/password login (backup method)
    Can also accept wallet address for wallet-based login
    """
    try:
        data = request.json
        
        # Check if wallet-based login
        if 'address' in data:
            address = data.get('address', '').lower()
            role_info = ROLE_ADDRESSES.get(address)
            
            if role_info:
                return jsonify({
                    'success': True,
                    'user': {
                        'address': Web3.to_checksum_address(address),
                        'role': role_info['role'],
                        'name': role_info['name'],
                        'permissions': role_info['permissions']
                    }
                })
        
        # Traditional username/password login
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'Username and password required'}), 400
        
        user = LEGACY_USERS.get(username)
        
        if user and user['password'] == password:
            return jsonify({
                'success': True,
                'user': {
                    'username': username,
                    'role': user['role'],
                    'address': user.get('address', ''),
                    'name': username.capitalize()
                }
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
            
    except Exception as e:
        print(f"Error in login: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/roles', methods=['GET'])
def get_roles():
    """
    Get all available roles and their wallet addresses
    Useful for admin interface
    """
    try:
        roles_list = []
        for address, info in ROLE_ADDRESSES.items():
            roles_list.append({
                'address': Web3.to_checksum_address(address),
                'role': info['role'],
                'name': info['name'],
                'permissions': info['permissions']
            })
        
        return jsonify({
            'success': True,
            'roles': roles_list
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/auth/verify', methods=['POST'])
def verify_permission():
    """
    Verify if a wallet address has a specific permission
    """
    try:
        data = request.json
        address = data.get('address', '').lower()
        required_permission = data.get('permission')
        
        if not address or not required_permission:
            return jsonify({'success': False, 'message': 'Address and permission required'}), 400
        
        role_info = ROLE_ADDRESSES.get(address)
        
        if not role_info:
            return jsonify({
                'success': False,
                'has_permission': False,
                'message': 'Address not registered'
            })
        
        has_permission = required_permission in role_info['permissions']
        
        return jsonify({
            'success': True,
            'has_permission': has_permission,
            'role': role_info['role']
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ========================================
# PROJECT MANAGEMENT ENDPOINTS
# ========================================

@app.route('/api/projects', methods=['GET'])
def get_projects():
    """Get all projects (filtered by role permissions)"""
    # Implement based on your database
    return jsonify({'success': True, 'projects': []})


@app.route('/api/projects/create', methods=['POST'])
def create_project():
    """Create new project (admin only)"""
    try:
        data = request.json
        address = data.get('creator_address', '').lower()
        
        # Verify admin permission
        role_info = ROLE_ADDRESSES.get(address)
        if not role_info or 'create_project' not in role_info['permissions']:
            return jsonify({'success': False, 'message': 'Permission denied'}), 403
        
        # Create project logic here
        return jsonify({'success': True, 'message': 'Project created'})
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/tenders/submit', methods=['POST'])
def submit_tender():
    """Submit tender (contractor only)"""
    try:
        data = request.json
        address = data.get('contractor_address', '').lower()
        
        # Verify contractor permission
        role_info = ROLE_ADDRESSES.get(address)
        if not role_info or 'submit_tender' not in role_info['permissions']:
            return jsonify({'success': False, 'message': 'Permission denied'}), 403
        
        # Submit tender logic here
        return jsonify({'success': True, 'message': 'Tender submitted'})
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/tenders/approve', methods=['POST'])
def approve_tender():
    """Approve tender (supervisor only) - Anonymous evaluation"""
    try:
        data = request.json
        address = data.get('supervisor_address', '').lower()
        
        # Verify supervisor permission
        role_info = ROLE_ADDRESSES.get(address)
        if not role_info or 'approve_tender' not in role_info['permissions']:
            return jsonify({'success': False, 'message': 'Permission denied'}), 403
        
        # Approve tender logic here (contractor identity hidden)
        return jsonify({'success': True, 'message': 'Tender approved'})
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ========================================
# SERVER STARTUP
# ========================================

if __name__ == '__main__':
    print("\n" + "="*70)
    print("🚀 Municipal Fund Blockchain API - Wallet-Based Authentication")
    print("="*70)
    print(f"🌐 RPC URL: {RPC_URL}")
    print(f"🔗 Blockchain: {'Connected ✓' if w3.is_connected() else 'Not Connected ✗'}")
    print(f"📜 Contract: Not deployed yet")
    print("\n👛 WALLET-BASED AUTHENTICATION (Recommended)")
    print("-" * 70)
    
    for address, info in ROLE_ADDRESSES.items():
        checksum_addr = Web3.to_checksum_address(address)
        print(f"🔑 {info['role'].upper().ljust(12)} Wallet:")
        print(f"   Address: {checksum_addr}")
        print(f"   Role: {info['name']}")
        print()
    
    print("="*70)
    print("📝 Legacy Username/Password (Optional):")
    for username, info in LEGACY_USERS.items():
        print(f"   {username} / {info['password']}")
    
    print("\n⚠️  SECURITY WARNING:")
    print("   These are TEST wallets for LOCAL DEVELOPMENT ONLY!")
    print("   NEVER use these private keys on mainnet or real networks!")
    print("="*70)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
