<<<<<<< HEAD
from flask import Flask, jsonify, request
from flask_cors import CORS
from web3 import Web3
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Blockchain connection
RPC_URL = os.getenv('RPC_URL', 'http://127.0.0.1:8545')
w3 = Web3(Web3.HTTPProvider(RPC_URL))

# Contract details (will be loaded after deployment)
CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS', '')
CONTRACT_ABI = []

# User database (simple in-memory for demo)
USERS = {
    'admin': {'password': 'admin123', 'role': 'admin', 'address': ''},
    'supervisor': {'password': 'super123', 'role': 'supervisor', 'address': ''},
    'citizen': {'password': 'citizen123', 'role': 'citizen', 'address': ''}
}

def load_contract():
    """Load contract ABI and assign addresses"""
    global CONTRACT_ABI, USERS
    
    try:
        # Load ABI
        abi_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'contractABI.json')
        if os.path.exists(abi_path):
            with open(abi_path, 'r') as f:
                CONTRACT_ABI = json.load(f)
        
        # Assign addresses from blockchain accounts
        if w3.is_connected():
            accounts = w3.eth.accounts
            if len(accounts) >= 3:
                USERS['admin']['address'] = accounts[0]
                USERS['supervisor']['address'] = accounts[1]
                USERS['citizen']['address'] = accounts[2]
                print(f"✓ Assigned addresses: Admin={accounts[0]}, Supervisor={accounts[1]}, Citizen={accounts[2]}")
            else:
                print("⚠ Not enough blockchain accounts. Using default addresses.")
        else:
            print("⚠ Blockchain not connected")
            
    except Exception as e:
        print(f"⚠ Error loading contract: {e}")

def get_contract():
    """Get contract instance"""
    if not CONTRACT_ADDRESS or not CONTRACT_ABI:
        return None
    return w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

@app.route('/')
def home():
    return jsonify({
        "message": "Municipal Fund Tracker API",
        "blockchain": "Connected" if w3.is_connected() else "Disconnected",
        "contract": CONTRACT_ADDRESS if CONTRACT_ADDRESS else "Not deployed yet",
        "version": "2.0 - With Anonymous Tenders",
        "endpoints": {
            "auth": "POST /api/login",
            "blockchain": "GET /api/blockchain/status",
            "projects": "GET /api/projects",
            "project": "GET /api/projects/:id",
            "create_project": "POST /api/projects/create",
            "tenders": "GET /api/tenders/:projectId",
            "submit_tender": "POST /api/tenders/submit",
            "approve_tender": "POST /api/tenders/approve",
            "milestones": "GET /api/milestones/:projectId",
            "submit_milestone": "POST /api/milestones/submit",
            "verify_milestone": "POST /api/milestones/verify",
            "stats": "GET /api/stats"
        }
    })

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if username in USERS and USERS[username]['password'] == password:
        return jsonify({
            "success": True,
            "user": {
                "username": username,
                "role": USERS[username]['role'],
                "address": USERS[username]['address']
            }
        })
    
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route('/api/blockchain/status')
def blockchain_status():
    return jsonify({
        "connected": w3.is_connected(),
        "rpc_url": RPC_URL,
        "contract_address": CONTRACT_ADDRESS if CONTRACT_ADDRESS else "Not deployed",
        "has_abi": len(CONTRACT_ABI) > 0,
        "accounts": w3.eth.accounts if w3.is_connected() else []
    })

@app.route('/api/projects')
def get_projects():
    contract = get_contract()
    if not contract:
        return jsonify({"error": "Contract not deployed"}), 500
    
    try:
        project_count = contract.functions.projectCount().call()
        projects = []
        
        for i in range(1, project_count + 1):
            try:
                project = contract.functions.getProject(i).call()
                projects.append({
                    "id": project[0],
                    "name": project[1],
                    "description": project[2],
                    "location": project[3],
                    "budget": project[4],
                    "allocatedFunds": project[5],
                    "spentFunds": project[6],
                    "admin": project[7],
                    "status": project[8],
                    "createdAt": project[9]
                })
            except:
                continue
        
        return jsonify({"projects": projects, "total": len(projects)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/projects/<int:project_id>')
def get_project(project_id):
    contract = get_contract()
    if not contract:
        return jsonify({"error": "Contract not deployed"}), 500
    
    try:
        project = contract.functions.getProject(project_id).call()
        return jsonify({
            "id": project[0],
            "name": project[1],
            "description": project[2],
            "location": project[3],
            "budget": project[4],
            "allocatedFunds": project[5],
            "spentFunds": project[6],
            "admin": project[7],
            "status": project[8],
            "createdAt": project[9]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tenders/<int:project_id>')
def get_tenders(project_id):
    contract = get_contract()
    if not contract:
        return jsonify({"error": "Contract not deployed"}), 500
    
    try:
        tender_ids = contract.functions.getProjectTenders(project_id).call()
        tenders = []
        
        for tender_id in tender_ids:
            tender = contract.functions.getTender(tender_id).call()
            tenders.append({
                "id": tender[0],
                "projectId": tender[1],
                "contractorCommitment": tender[2].hex(),
                "encryptedDataIPFS": tender[3],
                "tenderDocIPFS": tender[4],
                "qualityReportIPFS": tender[5],
                "status": tender[6],
                "submittedAt": tender[7]
            })
        
        return jsonify({"tenders": tenders, "total": len(tenders)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/milestones/<int:project_id>')
def get_milestones(project_id):
    contract = get_contract()
    if not contract:
        return jsonify({"error": "Contract not deployed"}), 500
    
    try:
        milestone_ids = contract.functions.getProjectMilestones(project_id).call()
        milestones = []
        
        for milestone_id in milestone_ids:
            milestone = contract.functions.getMilestone(milestone_id).call()
            milestones.append({
                "id": milestone[0],
                "projectId": milestone[1],
                "tenderId": milestone[2],
                "percentageComplete": milestone[3],
                "targetAmount": milestone[4],
                "spentAmount": milestone[5],
                "status": milestone[6],
                "submittedAt": milestone[7],
                "approvedAt": milestone[8]
            })
        
        return jsonify({"milestones": milestones, "total": len(milestones)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats')
def get_stats():
    contract = get_contract()
    if not contract:
        return jsonify({
            "totalBudget": 0,
            "allocatedFunds": 0,
            "spentFunds": 0,
            "projectCount": 0,
            "activeProjects": 0
        })
    
    try:
        project_count = contract.functions.projectCount().call()
        total_budget = 0
        allocated = 0
        spent = 0
        active = 0
        
        for i in range(1, project_count + 1):
            try:
                project = contract.functions.getProject(i).call()
                total_budget += project[4]  # budget
                allocated += project[5]  # allocatedFunds
                spent += project[6]  # spentFunds
                if project[8] == 1:  # InProgress status
                    active += 1
            except:
                continue
        
        return jsonify({
            "totalBudget": total_budget,
            "allocatedFunds": allocated,
            "spentFunds": spent,
            "projectCount": project_count,
            "activeProjects": active
=======
from flask import Flask, jsonify, requestfrom flask import Flask, jsonify, request

from flask_cors import CORSfrom flask_cors import CORS

from web3 import Web3from web3 import Web3

import jsonimport json

import osimport os

from datetime import datetimefrom datetime import datetime

from dotenv import load_dotenvfrom dotenv import load_dotenv

from pathlib import Pathfrom pathlib import Path



ROOT_DIR = Path(__file__).parentROOT_DIR = Path(__file__).parent

load_dotenv(ROOT_DIR / '.env')load_dotenv(ROOT_DIR / '.env')



app = Flask(__name__)app = Flask(__name__)

CORS(app)CORS(app)



# Web3 setup - Connect to local blockchain# Web3 setup - Connect to blockchain

RPC_URL = os.environ.get('RPC_URL', 'http://127.0.0.1:8545')RPC_URL = os.environ.get('POLYGON_RPC_URL', 'http://127.0.0.1:8545')

w3 = Web3(Web3.HTTPProvider(RPC_URL))w3 = Web3(Web3.HTTPProvider(RPC_URL))



# Contract will be loaded after deployment# Load contract ABI and address

CONTRACT_ADDRESS = NoneCONTRACT_ADDRESS = os.environ.get('CONTRACT_ADDRESS', '0x0000000000000000000000000000000000000000')

contract = NoneCONTRACT_ABI = []  # Will be loaded from file



# Demo users (3 login types)try:

users = {    with open(ROOT_DIR.parent / 'frontend' / 'contractABI.json', 'r') as f:

    'admin': {'role': 'admin', 'address': None, 'password': 'admin123'},        CONTRACT_ABI = json.load(f)

    'supervisor': {'role': 'supervisor', 'address': None, 'password': 'super123'},    with open(ROOT_DIR.parent / 'frontend' / 'contractAddress.json', 'r') as f:

    'citizen': {'role': 'citizen', 'address': None, 'password': 'citizen123'}        address_data = json.load(f)

}        CONTRACT_ADDRESS = address_data.get('address', CONTRACT_ADDRESS)

except Exception as e:

def load_contract():    print(f"Warning: Could not load contract files: {e}")

    global CONTRACT_ADDRESS, contract, users

    try:# Initialize contract

        # Load contract addresscontract = None

        address_file = ROOT_DIR.parent / 'frontend' / 'contractAddress.json'if CONTRACT_ABI and CONTRACT_ADDRESS != '0x0000000000000000000000000000000000000000':

        if address_file.exists():    try:

            with open(address_file, 'r') as f:        contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

                data = json.load(f)        print(f"✓ Connected to contract at {CONTRACT_ADDRESS}")

                CONTRACT_ADDRESS = data.get('address')    except Exception as e:

                print(f"Warning: Could not initialize contract: {e}")

        # Load contract ABI

        abi_file = ROOT_DIR.parent / 'frontend' / 'contractABI.json'# In-memory storage for demo

        if abi_file.exists():users = {

            with open(abi_file, 'r') as f:    'admin': {'role': 'admin', 'address': '0x' + '1' * 40, 'password': 'admin123'},

                abi = json.load(f)    'supervisor': {'role': 'supervisor', 'address': '0x' + '2' * 40, 'password': 'super123'},

                'citizen': {'role': 'citizen', 'address': '0x' + '3' * 40, 'password': 'citizen123'}

            if CONTRACT_ADDRESS and w3.is_connected():}

                contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=abi)users = {

                    'admin': {'role': 'admin', 'address': '0x' + '1' * 40, 'password': 'admin123'},

                # Assign addresses to users from accounts    'supervisor': {'role': 'supervisor', 'address': '0x' + '2' * 40, 'password': 'super123'},

                accounts = w3.eth.accounts    'citizen': {'role': 'citizen', 'address': '0x' + '3' * 40, 'password': 'citizen123'}

                if len(accounts) >= 3:}

                    users['admin']['address'] = accounts[0]

                    users['supervisor']['address'] = accounts[1]@app.route('/')

                    users['citizen']['address'] = accounts[2]def home():

                    return jsonify({

                print(f"✓ Contract loaded at {CONTRACT_ADDRESS}")        "message": "Municipal Fund Tracker API",

                print(f"✓ Admin: {users['admin']['address']}")        "blockchain": "Connected" if w3.is_connected() else "Disconnected",

                print(f"✓ Supervisor: {users['supervisor']['address']}")        "contract": CONTRACT_ADDRESS,

                print(f"✓ Citizen: {users['citizen']['address']}")        "endpoints": {

                return True            "auth": "POST /api/login",

    except Exception as e:            "projects": "GET /api/projects",

        print(f"Warning: Could not load contract: {e}")            "create_project": "POST /api/projects/create",

    return False            "submit_tender": "POST /api/tenders/submit",

            "approve_tender": "POST /api/tenders/approve",

@app.route('/')            "submit_milestone": "POST /api/milestones/submit",

def home():            "verify_milestone": "POST /api/milestones/verify",

    return jsonify({            "stats": "GET /api/stats"

        "message": "Municipal Fund Tracker API",        }

        "blockchain": "Connected" if w3.is_connected() else "Disconnected",    })

        "contract": CONTRACT_ADDRESS,

        "version": "2.0 - With Anonymous Tenders",@app.route('/api/login', methods=['POST'])

        "endpoints": {def login():

            "auth": "POST /api/login",    data = request.get_json()

            "blockchain": "GET /api/blockchain/status",    username = data.get('username')

            "projects": "GET /api/projects",    password = data.get('password')

            "create_project": "POST /api/projects/create",    

            "tenders": "GET /api/tenders/:projectId",    user = users.get(username)

            "stats": "GET /api/stats"    if user and user['password'] == password:

        }        return jsonify({

    })            'success': True,

            'user': {

@app.route('/api/login', methods=['POST'])                'username': username,

def login():                'role': user['role'],

    data = request.get_json()                'address': user['address']

    username = data.get('username')            },

    password = data.get('password')            'token': f"token_{username}_{datetime.now().timestamp()}"

            })

    user = users.get(username)    

    if user and user['password'] == password:    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

        return jsonify({

            'success': True,@app.route('/api/blockchain/status')

            'user': {def blockchain_status():

                'username': username,    try:

                'role': user['role'],        is_connected = w3.is_connected()

                'address': user['address']        latest_block = w3.eth.block_number if is_connected else None

            },        return jsonify({

            'token': f"token_{username}_{int(datetime.now().timestamp())}"            "connected": is_connected,

        })            "network": "Local/Sepolia",

                "latest_block": latest_block,

    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401            "rpc_url": RPC_URL,

            "contract_address": CONTRACT_ADDRESS

@app.route('/api/blockchain/status')        })

def blockchain_status():    except Exception as e:

    try:        return jsonify({"connected": False, "error": str(e)})

        is_connected = w3.is_connected()

        return jsonify({@app.route('/api/projects', methods=['GET'])

            "connected": is_connected,def get_projects():

            "network": "Local Hardhat" if 'localhost' in RPC_URL else "Sepolia",    try:

            "latest_block": w3.eth.block_number if is_connected else 0,        if not contract:

            "rpc_url": RPC_URL,            return jsonify({"error": "Contract not initialized"}), 500

            "contract_address": CONTRACT_ADDRESS,        

            "accounts": len(w3.eth.accounts) if is_connected else 0        project_count = contract.functions.projectCount().call()

        })        projects = []

    except Exception as e:        

        return jsonify({"connected": False, "error": str(e)})        for i in range(1, project_count + 1):

            try:

@app.route('/api/projects', methods=['GET'])                project = contract.functions.getProject(i).call()

def get_projects():                projects.append({

    try:                    'id': project[0],

        if not contract:                    'name': project[1],

            return jsonify([])                    'budget': project[2],

                            'allocatedFunds': project[3],

        project_count = contract.functions.projectCount().call()                    'spentFunds': project[4],

        projects = []                    'admin': project[5],

                            'status': ['Created', 'TenderAssigned', 'InProgress', 'Completed'][project[7]],

        for i in range(1, project_count + 1):                    'location': project[8],

            try:                    'createdAt': project[9]

                project = contract.functions.getProject(i).call()                })

                projects.append({            except Exception as e:

                    'id': project[0],                print(f"Error fetching project {i}: {e}")

                    'name': project[1],        

                    'budget': project[2],        return jsonify(projects)

                    'allocatedFunds': project[3],    except Exception as e:

                    'spentFunds': project[4],        return jsonify({"error": str(e)}), 500

                    'admin': project[5],

                    'status': ['Created', 'TenderAssigned', 'InProgress', 'Completed'][project[7]],@app.route('/api/projects/create', methods=['POST'])

                    'location': project[8],def create_project():

                    'createdAt': project[9]    try:

                })        data = request.get_json()

            except Exception as e:        name = data.get('name')

                print(f"Error fetching project {i}: {e}")        budget = int(data.get('budget', 0))

                location = data.get('location', '')

        return jsonify(projects)        supervisor_commitment = data.get('supervisorCommitment', '0x' + '0' * 64)

    except Exception as e:        admin_address = data.get('adminAddress')

        return jsonify({"error": str(e)}), 500        

        if not contract:

@app.route('/api/tenders/<int:project_id>')            return jsonify({"error": "Contract not initialized"}), 500

def get_tenders(project_id):        

    try:        # Build transaction

        if not contract:        tx = contract.functions.createProject(

            return jsonify([])            name,

                    budget,

        tender_ids = contract.functions.getProjectTenders(project_id).call()            bytes.fromhex(supervisor_commitment[2:] if supervisor_commitment.startswith('0x') else supervisor_commitment),

        tenders = []            location

                ).build_transaction({

        for tender_id in tender_ids:            'from': admin_address,

            tender = contract.functions.getTender(tender_id).call()            'nonce': w3.eth.get_transaction_count(admin_address),

            tenders.append({            'gas': 500000,

                'id': tender[0],            'gasPrice': w3.eth.gas_price

                'projectId': tender[1],        })

                'status': ['Submitted', 'UnderReview', 'Approved', 'Rejected'][tender[6]],        

                'submittedAt': tender[7]        return jsonify({

            })            'success': True,

                    'transaction': tx,

        return jsonify(tenders)            'message': 'Please sign this transaction in your wallet'

    except Exception as e:        })

        return jsonify({"error": str(e)}), 500    except Exception as e:

        return jsonify({"error": str(e)}), 500

@app.route('/api/stats')

def get_stats():@app.route('/api/tenders/submit', methods=['POST'])

    try:def submit_tender():

        if not contract:    try:

            return jsonify({        data = request.get_json()

                "total_projects": 0,        project_id = int(data.get('projectId'))

                "active_projects": 0,        contractor_commitment = data.get('contractorCommitment')

                "total_budget": 0,        encrypted_data_ipfs = data.get('encryptedDataIPFS', '')

                "total_allocated": 0,        tender_doc_ipfs = data.get('tenderDocIPFS', '')

                "total_spent": 0        quality_report_ipfs = data.get('qualityReportIPFS', '')

            })        contractor_address = data.get('contractorAddress')

                

        project_count = contract.functions.projectCount().call()        if not contract:

        total_budget = 0            return jsonify({"error": "Contract not initialized"}), 500

        total_allocated = 0        

        total_spent = 0        tx = contract.functions.submitAnonymousTender(

        active_projects = 0            project_id,

                    bytes.fromhex(contractor_commitment[2:] if contractor_commitment.startswith('0x') else contractor_commitment),

        for i in range(1, project_count + 1):            encrypted_data_ipfs,

            try:            tender_doc_ipfs,

                project = contract.functions.getProject(i).call()            quality_report_ipfs

                total_budget += project[2]        ).build_transaction({

                total_allocated += project[3]            'from': contractor_address,

                total_spent += project[4]            'nonce': w3.eth.get_transaction_count(contractor_address),

                if project[7] < 3:  # Status < Completed            'gas': 500000,

                    active_projects += 1            'gasPrice': w3.eth.gas_price

            except:        })

                pass        

                return jsonify({

        return jsonify({            'success': True,

            "total_projects": project_count,            'transaction': tx,

            "active_projects": active_projects,            'message': 'Please sign this transaction in your wallet'

            "total_budget": total_budget,        })

            "total_allocated": total_allocated,    except Exception as e:

            "total_spent": total_spent,        return jsonify({"error": str(e)}), 500

            "unallocated_funds": total_budget - total_allocated,

            "budget_utilization": (total_spent / total_budget * 100) if total_budget > 0 else 0@app.route('/api/stats')

        })def get_stats():

    except Exception as e:    try:

        return jsonify({"error": str(e)}), 500        if not contract:

            # Return mock data if contract not available

if __name__ == '__main__':            return jsonify({

    print("\n" + "="*60)                "total_projects": 0,

    print("🚀 MUNICIPAL FUND TRACKER API")                "active_projects": 0,

    print("="*60)                "total_budget": 0,

    print(f"📍 Backend: http://localhost:5000")                "total_allocated": 0,

    print(f"🔗 Blockchain: {'Connected' if w3.is_connected() else 'Disconnected'}")                "total_spent": 0

                })

    load_contract()        

            project_count = contract.functions.projectCount().call()

    print("\n👥 DEMO ACCOUNTS (3 Login Types):")        total_budget = 0

    print("   1. Admin: admin / admin123")        total_allocated = 0

    print("   2. Supervisor: supervisor / super123")        total_spent = 0

    print("   3. Citizen: citizen / citizen123")        active_projects = 0

    print("="*60 + "\n")        

            for i in range(1, project_count + 1):

    app.run(debug=True, port=5000, use_reloader=False)            try:

                project = contract.functions.getProject(i).call()
                total_budget += project[2]
                total_allocated += project[3]
                total_spent += project[4]
                if project[7] < 3:  # Status < Completed
                    active_projects += 1
            except:
                pass
        
        return jsonify({
            "total_projects": project_count,
            "active_projects": active_projects,
            "total_budget": total_budget,
            "total_allocated": total_allocated,
            "total_spent": total_spent,
            "unallocated_funds": total_budget - total_allocated,
            "budget_utilization": (total_spent / total_budget * 100) if total_budget > 0 else 0
>>>>>>> 285a861e64433230c2995fc3476a647205a444b0
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
<<<<<<< HEAD
    print("\n" + "="*50)
    print("Municipal Fund Blockchain API Server")
    print("="*50)
    print(f"RPC URL: {RPC_URL}")
    print(f"Blockchain Connected: {w3.is_connected()}")
    print(f"Contract Address: {CONTRACT_ADDRESS if CONTRACT_ADDRESS else 'Not deployed yet'}")
    print("\nUser Accounts:")
    print("  Admin:      admin / admin123")
    print("  Supervisor: supervisor / super123")
    print("  Citizen:    citizen / citizen123")
    print("\n⚠️  SECURITY WARNING:")
    print("  Your MetaMask private key was shared publicly!")
    print("  Transfer all funds and create a NEW wallet immediately!")
    print("="*50 + "\n")
    
    load_contract()
    app.run(host='0.0.0.0', port=5000, debug=True)
=======
    print("🚀 Starting Municipal Fund Tracker API...")
    print(f"📍 Backend: http://localhost:5000")
    print(f"🔗 Blockchain: {'Connected' if w3.is_connected() else 'Disconnected'}")
    print(f"📜 Contract: {CONTRACT_ADDRESS}")
    print("\n👥 Demo Accounts:")
    print("   Admin: admin/admin123")
    print("   Supervisor: supervisor/super123")
    print("   Citizen: citizen/citizen123")
    app.run(debug=True, port=5000)
    milestone_id: Optional[str] = None
    amount: float
    category: str = "General"  # Materials, Labor, Equipment, Services, etc.
    description: str
    recipient: str
    tx_hash: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    verified: bool = False

class ExpenditureCreate(BaseModel):
    project_id: str
    milestone_id: Optional[str] = None
    amount: float
    category: str
    description: str
    recipient: str
    tx_hash: str

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tx_hash: str
    type: str  # project_create, milestone_create, expenditure, fund_allocation
    project_id: Optional[str] = None
    details: dict
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    block_number: Optional[int] = None
    verified: bool = False

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Municipal Fund Tracker API", "blockchain": "Polygon Mumbai"}

@api_router.get("/blockchain/status")
async def blockchain_status():
    try:
        is_connected = w3.is_connected()
        latest_block = w3.eth.block_number if is_connected else None
        return {
            "connected": is_connected,
            "network": "Polygon Mumbai",
            "latest_block": latest_block,
            "rpc_url": POLYGON_RPC
        }
    except Exception as e:
        return {"connected": False, "error": str(e)}

# Project endpoints
@api_router.post("/projects", response_model=Project)
async def create_project(input: ProjectCreate):
    project_dict = input.model_dump()
    project_obj = Project(**project_dict)
    
    doc = project_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('completion_date'):
        doc['completion_date'] = doc['completion_date'].isoformat()
    
    await db.projects.insert_one(doc)
    
    # Record transaction
    if input.tx_hash:
        tx_record = Transaction(
            tx_hash=input.tx_hash,
            type="project_create",
            project_id=project_obj.id,
            details={"name": input.name, "budget": input.budget, "category": input.category}
        )
        tx_doc = tx_record.model_dump()
        tx_doc['timestamp'] = tx_doc['timestamp'].isoformat()
        await db.transactions.insert_one(tx_doc)
    
    return project_obj

@api_router.get("/projects", response_model=List[Project])
async def get_projects():
    projects = await db.projects.find({}, {"_id": 0}).to_list(1000)
    for project in projects:
        if isinstance(project['created_at'], str):
            project['created_at'] = datetime.fromisoformat(project['created_at'])
    return projects

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if isinstance(project['created_at'], str):
        project['created_at'] = datetime.fromisoformat(project['created_at'])
    return project

# Fund Allocation endpoints
@api_router.post("/allocations", response_model=FundAllocation)
async def allocate_funds(input: FundAllocationCreate):
    # Verify project exists
    project = await db.projects.find_one({"id": input.project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    allocation_dict = input.model_dump()
    allocation_obj = FundAllocation(**allocation_dict)
    
    doc = allocation_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.fund_allocations.insert_one(doc)
    
    # Update project allocated funds
    await db.projects.update_one(
        {"id": input.project_id},
        {"$inc": {"allocated_funds": input.amount}}
    )
    
    # Record transaction
    tx_record = Transaction(
        tx_hash=input.tx_hash,
        type="fund_allocation",
        project_id=input.project_id,
        details={"amount": input.amount, "purpose": input.purpose}
    )
    tx_doc = tx_record.model_dump()
    tx_doc['timestamp'] = tx_doc['timestamp'].isoformat()
    await db.transactions.insert_one(tx_doc)
    
    return allocation_obj

@api_router.get("/allocations/{project_id}", response_model=List[FundAllocation])
async def get_project_allocations(project_id: str):
    allocations = await db.fund_allocations.find({"project_id": project_id}, {"_id": 0}).to_list(1000)
    for alloc in allocations:
        if isinstance(alloc['timestamp'], str):
            alloc['timestamp'] = datetime.fromisoformat(alloc['timestamp'])
    return allocations

# Milestone endpoints
@api_router.post("/milestones", response_model=Milestone)
async def create_milestone(input: MilestoneCreate):
    # Verify project exists
    project = await db.projects.find_one({"id": input.project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    milestone_dict = input.model_dump()
    milestone_obj = Milestone(**milestone_dict)
    
    doc = milestone_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('completion_date'):
        doc['completion_date'] = doc['completion_date'].isoformat()
    
    await db.milestones.insert_one(doc)
    
    # Record transaction
    if input.tx_hash:
        tx_record = Transaction(
            tx_hash=input.tx_hash,
            type="milestone_create",
            project_id=input.project_id,
            details={"milestone_name": input.name, "target_amount": input.target_amount}
        )
        tx_doc = tx_record.model_dump()
        tx_doc['timestamp'] = tx_doc['timestamp'].isoformat()
        await db.transactions.insert_one(tx_doc)
    
    return milestone_obj

@api_router.get("/milestones/{project_id}", response_model=List[Milestone])
async def get_project_milestones(project_id: str):
    milestones = await db.milestones.find({"project_id": project_id}, {"_id": 0}).to_list(1000)
    for milestone in milestones:
        if isinstance(milestone['created_at'], str):
            milestone['created_at'] = datetime.fromisoformat(milestone['created_at'])
        if milestone.get('completion_date') and isinstance(milestone['completion_date'], str):
            milestone['completion_date'] = datetime.fromisoformat(milestone['completion_date'])
    return milestones

@api_router.put("/milestones/{milestone_id}", response_model=Milestone)
async def update_milestone(milestone_id: str, input: MilestoneUpdate):
    milestone = await db.milestones.find_one({"id": milestone_id}, {"_id": 0})
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    
    if "status" in update_data and update_data["status"] == "Completed":
        update_data["completion_date"] = datetime.now(timezone.utc).isoformat()
    
    await db.milestones.update_one({"id": milestone_id}, {"$set": update_data})
    
    # Update project spent funds
    if "spent_amount" in update_data:
        project = await db.projects.find_one({"id": milestone["project_id"]})
        if project:
            old_spent = milestone.get("spent_amount", 0)
            new_spent = update_data["spent_amount"]
            diff = new_spent - old_spent
            await db.projects.update_one(
                {"id": milestone["project_id"]},
                {"$inc": {"spent_funds": diff}}
            )
    
    updated_milestone = await db.milestones.find_one({"id": milestone_id}, {"_id": 0})
    if isinstance(updated_milestone['created_at'], str):
        updated_milestone['created_at'] = datetime.fromisoformat(updated_milestone['created_at'])
    if updated_milestone.get('completion_date') and isinstance(updated_milestone['completion_date'], str):
        updated_milestone['completion_date'] = datetime.fromisoformat(updated_milestone['completion_date'])
    
    return updated_milestone

# Expenditure endpoints
@api_router.post("/expenditures", response_model=Expenditure)
async def create_expenditure(input: ExpenditureCreate):
    # Verify project exists
    project = await db.projects.find_one({"id": input.project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    expenditure_dict = input.model_dump()
    expenditure_obj = Expenditure(**expenditure_dict)
    
    doc = expenditure_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.expenditures.insert_one(doc)
    
    # Update project spent funds
    await db.projects.update_one(
        {"id": input.project_id},
        {"$inc": {"spent_funds": input.amount}}
    )
    
    # Update milestone if specified
    if input.milestone_id:
        await db.milestones.update_one(
            {"id": input.milestone_id},
            {"$inc": {"spent_amount": input.amount}}
        )
    
    # Record transaction
    tx_record = Transaction(
        tx_hash=input.tx_hash,
        type="expenditure",
        project_id=input.project_id,
        details={
            "amount": input.amount,
            "category": input.category,
            "description": input.description,
            "recipient": input.recipient
        }
    )
    tx_doc = tx_record.model_dump()
    tx_doc['timestamp'] = tx_doc['timestamp'].isoformat()
    await db.transactions.insert_one(tx_doc)
    
    return expenditure_obj

@api_router.get("/expenditures/{project_id}", response_model=List[Expenditure])
async def get_project_expenditures(project_id: str):
    expenditures = await db.expenditures.find({"project_id": project_id}, {"_id": 0}).to_list(1000)
    for exp in expenditures:
        if isinstance(exp['timestamp'], str):
            exp['timestamp'] = datetime.fromisoformat(exp['timestamp'])
    return expenditures

# Transaction endpoints
@api_router.get("/transactions", response_model=List[Transaction])
async def get_all_transactions():
    transactions = await db.transactions.find({}, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    for tx in transactions:
        if isinstance(tx['timestamp'], str):
            tx['timestamp'] = datetime.fromisoformat(tx['timestamp'])
    return transactions

@api_router.get("/transactions/{project_id}", response_model=List[Transaction])
async def get_project_transactions(project_id: str):
    transactions = await db.transactions.find({"project_id": project_id}, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    for tx in transactions:
        if isinstance(tx['timestamp'], str):
            tx['timestamp'] = datetime.fromisoformat(tx['timestamp'])
    return transactions

@api_router.get("/verify/{tx_hash}")
async def verify_transaction(tx_hash: str):
    try:
        tx = w3.eth.get_transaction(tx_hash)
        receipt = w3.eth.get_transaction_receipt(tx_hash)
        
        return {
            "verified": True,
            "tx_hash": tx_hash,
            "block_number": receipt['blockNumber'],
            "from": receipt['from'],
            "to": receipt['to'],
            "status": receipt['status'],
            "gas_used": receipt['gasUsed'],
            "explorer_url": f"https://mumbai.polygonscan.com/tx/{tx_hash}"
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Transaction not found: {str(e)}")

@api_router.get("/stats")
async def get_stats():
    total_projects = await db.projects.count_documents({})
    active_projects = await db.projects.count_documents({"status": "Active"})
    total_milestones = await db.milestones.count_documents({})
    completed_milestones = await db.milestones.count_documents({"status": "Completed"})
    total_expenditures = await db.expenditures.count_documents({})
    
    # Calculate total budget, allocated, and spent
    projects = await db.projects.find({}, {"_id": 0}).to_list(1000)
    total_budget = sum(p.get('budget', 0) for p in projects)
    total_allocated = sum(p.get('allocated_funds', 0) for p in projects)
    total_spent = sum(p.get('spent_funds', 0) for p in projects)
    
    # Category breakdown
    expenditures = await db.expenditures.find({}, {"_id": 0}).to_list(1000)
    category_spending = {}
    for exp in expenditures:
        category = exp.get('category', 'General')
        category_spending[category] = category_spending.get(category, 0) + exp.get('amount', 0)
    
    # Project category breakdown
    project_category_budget = {}
    project_category_spent = {}
    for p in projects:
        category = p.get('category', 'Other')
        project_category_budget[category] = project_category_budget.get(category, 0) + p.get('budget', 0)
        project_category_spent[category] = project_category_spent.get(category, 0) + p.get('spent_funds', 0)
    
    return {
        "total_projects": total_projects,
        "active_projects": active_projects,
        "total_milestones": total_milestones,
        "completed_milestones": completed_milestones,
        "total_expenditures": total_expenditures,
        "total_budget": total_budget,
        "total_allocated": total_allocated,
        "total_spent": total_spent,
        "unallocated_funds": total_budget - total_allocated,
        "allocated_unspent": total_allocated - total_spent,
        "budget_utilization": (total_spent / total_budget * 100) if total_budget > 0 else 0,
        "allocation_rate": (total_allocated / total_budget * 100) if total_budget > 0 else 0,
        "spending_rate": (total_spent / total_allocated * 100) if total_allocated > 0 else 0,
        "expenditure_by_category": category_spending,
        "budget_by_project_category": project_category_budget,
        "spent_by_project_category": project_category_spent
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
>>>>>>> 285a861e64433230c2995fc3476a647205a444b0
