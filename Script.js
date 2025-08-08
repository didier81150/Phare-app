// Configuration
const APP_CONFIG = {
    // Les configurations de sécurité (mots de passe, clé de chiffrement)
    // sont maintenant gérées dynamiquement et ne sont plus stockées en clair dans le code.
};

// Base de données des élèves (simulation)
const STUDENT_DATABASE = [
    { id: "marie.dupont", class: "6G1", active: true },
    { id: "paul.martin", class: "6G2", active: true },
    { id: "sophie.bernard", class: "5G2", active: true },
    { id: "lucas.petit", class: "5G3", active: true },
    { id: "emma.robert", class: "4G5", active: true },
    { id: "hugo.moreau", class: "4G2", active: true },
    { id: "lea.simon", class: "3G8", active: true },
    { id: "theo.laurent", class: "3G1", active: true }
];

// Utilitaires de chiffrement
function encryptData(data, key) {
    if (!key) {
        console.error("Tentative de chiffrement sans clé.");
        return null;
    }
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
}

function decryptData(encryptedData, key) {
    if (!encryptedData || !key) return null;
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, key);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedString) {
            // This can happen if the key is wrong
            return null;
        }
        return JSON.parse(decryptedString);
    } catch (e) {
        console.error("Erreur de déchiffrement:", e);
        return null;
    }
}

// Gestion des pages
class PageManager {
    constructor() {
        this.currentPage = 'homePage';
        this.initializeEventListeners();
        this.loadLogo();
    }

    showPage(pageId) {
        document.querySelectorAll('[id$="Page"], #adminPanel, #studentManagement').forEach(page => {
            page.classList.add('hidden');
        });
        document.getElementById(pageId).classList.remove('hidden');
        this.currentPage = pageId;
    }

    initializeEventListeners() {
        // Navigation depuis l'accueil
        const studentLoginBtn = document.getElementById('studentLoginBtn');
        if (studentLoginBtn) {
            studentLoginBtn.addEventListener('click', () => {
                this.showPage('studentLoginPage');
            });
        }
        
        const adminLoginBtn = document.getElementById('adminLoginBtn');
        if (adminLoginBtn) {
            adminLoginBtn.addEventListener('click', () => {
                this.showPage('adminLoginPage');
            });
        }

        // Navigation élèves
        const alreadyRegisteredBtn = document.getElementById('alreadyRegisteredBtn');
        if (alreadyRegisteredBtn) {
            alreadyRegisteredBtn.addEventListener('click', () => {
                this.showPage('studentLoginPage');
            });
        }

        // Retours à l'accueil
        const backToHomeBtn = document.getElementById('backToHomeBtn');
        if (backToHomeBtn) {
            backToHomeBtn.addEventListener('click', () => {
                this.showPage('homePage');
            });
        }
        
        const backToHomeFromLoginBtn = document.getElementById('backToHomeFromLoginBtn');
        if (backToHomeFromLoginBtn) {
            backToHomeFromLoginBtn.addEventListener('click', () => {
                this.resetLoginForm();
                this.showPage('homePage');
            });
        }
        
        const backToHomeFromAdminBtn = document.getElementById('backToHomeFromAdminBtn');
        if (backToHomeFromAdminBtn) {
            backToHomeFromAdminBtn.addEventListener('click', () => {
                this.showPage('homePage');
            });
        }

        // Navigation admin
        const manageStudentsBtn = document.getElementById('manageStudentsBtn');
        if (manageStudentsBtn) {
            manageStudentsBtn.addEventListener('click', () => {
                this.showPage('studentManagement');
                if (window.studentManager) {
                    studentManager.renderTable();
                    studentManager.updateStatistics();
                }
            });
        }
        
        const backToAdminBtn = document.getElementById('backToAdminBtn');
        if (backToAdminBtn) {
            backToAdminBtn.addEventListener('click', () => {
                this.showPage('adminPanel');
                if (window.reportSystem) {
                    reportSystem.updateAdminDisplay();
                }
            });
        }

        // Déconnexions
        const studentLogoutBtn = document.getElementById('studentLogoutBtn');
        if (studentLogoutBtn) {
            studentLogoutBtn.addEventListener('click', () => {
                this.showPage('homePage');
            });
        }
        
        const adminLogoutBtn = document.getElementById('adminLogoutBtn');
        if (adminLogoutBtn) {
            adminLogoutBtn.addEventListener('click', () => {
                if (window.adminAuth) {
                    adminAuth.logout();
                } else {
                    this.showPage('homePage');
                }
            });
        }

        // Upload logo
        const logoUpload = document.getElementById('logoUpload');
        if (logoUpload) {
            logoUpload.addEventListener('change', (e) => {
                this.handleLogoUpload(e);
            });
        }
    }

    loadLogo() {
        const savedLogo = localStorage.getItem('collegeLogo');
        if (savedLogo) {
            document.getElementById('logoImage').src = savedLogo;
            document.getElementById('logoImage').classList.remove('hidden');
            document.getElementById('defaultLogo').classList.add('hidden');
        }
    }

    handleLogoUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const logoData = e.target.result;
                localStorage.setItem('collegeLogo', logoData);
                document.getElementById('logoImage').src = logoData;
                document.getElementById('logoImage').classList.remove('hidden');
                document.getElementById('defaultLogo').classList.add('hidden');
                this.showNotification('Logo mis à jour avec succès', 'success');
            };
            reader.readAsDataURL(file);
        }
    }

    resetLoginForm() {
        const loginForm = document.getElementById('studentLoginForm');
        if (loginForm) {
            loginForm.innerHTML = `
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Identifiant</label>
                    <input type="text" id="loginStudentId" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="votre.identifiant" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                    <input type="password" id="loginPassword" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="pasteur2025 (1ère fois) ou votre code secret" required>
                    <p class="text-xs text-gray-500 mt-1">Première connexion : utilisez "pasteur2025"</p>
                </div>
                <button type="submit" class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200">
                    Se connecter
                </button>
            `;
            
            // Réattacher l'événement de soumission
            loginForm.addEventListener('submit', (e) => {
                if (window.studentAuth) {
                    studentAuth.handleLogin(e);
                }
            });
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Système d'authentification des élèves
class StudentAuth {
    constructor() {
        // La liste des élèves inscrits est maintenant gérée par StudentManager et sécurisée par le mot de passe admin.
        this.currentStudent = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Le formulaire d'auto-inscription est maintenant désactivé pour des raisons de sécurité.
        // La création des comptes se fait par un admin.
        const studentRegisterForm = document.getElementById('studentRegisterForm');
        if(studentRegisterForm) {
            studentRegisterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showMessage('registerMessage', "L'auto-inscription n'est plus disponible. Veuillez contacter un administrateur.", 'error');
            });
        }
        
        document.getElementById('studentLoginForm').addEventListener('submit', (e) => {
            this.handleLogin(e);
        });
    }

    generatePassword() {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    handleLogin(e) {
        e.preventDefault();
        
        const studentId = document.getElementById('loginStudentId').value.toLowerCase();
        const password = document.getElementById('loginPassword').value;

        if (!studentManager) {
            this.showMessage('loginMessage', 'Le système de gestion des élèves n\'est pas initialisé.', 'error');
            return;
        }

        const studentInDB = studentManager.students.find(s => s.id === studentId);

        if (!studentInDB) {
            this.showMessage('loginMessage', 'Identifiant ou mot de passe incorrect.', 'error');
            return;
        }

        // Cas 1: L'élève a déjà un code secret (connexion normale)
        if (studentInDB.secretCode && studentInDB.password === 'USED') {
            const passwordHash = CryptoJS.SHA256(password).toString();
            if (passwordHash === studentInDB.secretCode) { // On compare directement avec le hash stocké
                this.currentStudent = studentInDB;
                pageManager.showPage('studentReportPage');
            } else {
                this.showMessage('loginMessage', 'Identifiant ou mot de passe incorrect.', 'error');
            }
            return;
        }

        // Cas 2: C'est la première connexion, on vérifie le mot de passe initial
        if (password === studentInDB.password) {
            // Première connexion réussie -> on génère le code secret
            this.showSecretCodeCreation(studentId, studentInDB);
        } else {
            this.showMessage('loginMessage', 'Identifiant ou mot de passe incorrect.', 'error');
        }
    }

    generateSecretCode() {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    showSecretCodeCreation(studentId, studentInDB) {
        // Générer le code secret
        const secretCode = this.generateSecretCode();
        
        // Créer l'interface de saisie du code
        const loginForm = document.getElementById('studentLoginForm');
        loginForm.innerHTML = `
            <div class="text-center mb-6">
                <div class="bg-green-100 p-4 rounded-lg mb-4">
                    <h3 class="font-bold text-green-800 mb-2">🎉 Première connexion réussie !</h3>
                    <p class="text-green-700 text-sm">Votre code secret personnel a été généré</p>
                </div>
                
                <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                    <p class="text-blue-800 font-semibold mb-2">Votre code secret :</p>
                    <div class="text-3xl font-mono font-bold text-blue-900 bg-white p-4 rounded border-2 border-blue-300 tracking-widest">
                        ${secretCode}
                    </div>
                    <p class="text-blue-700 text-sm mt-3">
                        📱 <strong>IMPORTANT :</strong> Mémorisez ce code dans votre téléphone !<br>
                        Vous en aurez besoin pour toutes vos prochaines connexions.
                    </p>
                </div>
            </div>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Pour confirmer, ressaisissez votre code secret :
                    </label>
                    <input type="text" id="confirmSecretCode" 
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center font-mono text-lg tracking-widest" 
                           placeholder="Saisissez le code ci-dessus" 
                           maxlength="6" 
                           style="text-transform: uppercase;"
                           required>
                </div>
                
                <button type="button" id="confirmCodeBtn" 
                        class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200">
                    Confirmer et continuer
                </button>
                
                <div class="text-center">
                    <button type="button" id="regenerateCodeBtn" 
                            class="text-blue-600 hover:text-blue-700 text-sm">
                        🔄 Générer un nouveau code
                    </button>
                </div>
            </div>
        `;
        
        // Ajouter les événements
        document.getElementById('confirmCodeBtn').addEventListener('click', () => {
            this.confirmSecretCode(studentId, studentInDB, secretCode);
        });
        
        document.getElementById('regenerateCodeBtn').addEventListener('click', () => {
            this.showSecretCodeCreation(studentId, studentInDB);
        });
        
        // Auto-uppercase pour la saisie
        document.getElementById('confirmSecretCode').addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
        
        // Validation en temps réel
        document.getElementById('confirmSecretCode').addEventListener('input', (e) => {
            const confirmBtn = document.getElementById('confirmCodeBtn');
            if (e.target.value === secretCode) {
                confirmBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
                confirmBtn.classList.add('bg-green-600', 'hover:bg-green-700');
                confirmBtn.innerHTML = '✅ Code correct - Continuer';
            } else {
                confirmBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
                confirmBtn.classList.add('bg-green-500', 'hover:bg-green-600');
                confirmBtn.innerHTML = 'Confirmer et continuer';
            }
        });
    }

    confirmSecretCode(studentId, studentInDB, originalSecretCode) {
        const enteredCode = document.getElementById('confirmSecretCode').value.toUpperCase();
        
        if (enteredCode !== originalSecretCode) {
            this.showMessage('loginMessage', 'Le code saisi ne correspond pas. Veuillez réessayer.', 'error');
            return;
        }
        
        // Code confirmé - finaliser l'inscription
        // On stocke le HASH du code secret, pas le code lui-même.
        studentInDB.secretCode = CryptoJS.SHA256(originalSecretCode).toString();
        // Le mot de passe initial n'est plus nécessaire.
        studentInDB.password = 'USED'; 
        studentManager.saveStudents();
        
        if (window.studentManager) {
            studentManager.renderTable();
        }

        this.currentStudent = studentInDB;
        
        // Afficher le message de succès et rediriger
        this.showMessage('loginMessage', 
            `✅ Parfait ! Votre code secret ${originalSecretCode} est maintenant enregistré. Vous pouvez accéder à la plateforme.`, 
            'success');
        
        setTimeout(() => {
            pageManager.showPage('studentReportPage');
        }, 3000);
    }

    showMessage(elementId, message, type) {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.className = `mt-4 p-3 rounded-lg text-center ${
            type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`;
        element.classList.remove('hidden');
        
        setTimeout(() => {
            element.classList.add('hidden');
        }, 5000);
    }
}

// Gestion des élèves (Admin uniquement)
class StudentManager {
    constructor() {
        this.students = this.loadStudents();
        this.selectedRow = null;
        this.initializeEventListeners();
    }

    loadStudents() {
        const encrypted = localStorage.getItem('studentDatabase_encrypted');
        const decrypted = decryptData(encrypted, adminAuth.masterKey);
        
        if (decrypted) {
            this.students = decrypted;
            return true;
        }
        
        if (!encrypted) {
            // Si aucune donnée n'existe, on part d'un tableau vide
            this.students = [];
            return true;
        }

        // Si les données existent mais n'ont pas pu être déchiffrées
        return false;
    }

    saveStudents() {
        const encrypted = encryptData(this.students, adminAuth.masterKey);
        if(encrypted) {
            localStorage.setItem('studentDatabase_encrypted', encrypted);
        }
    }

    initializeEventListeners() {
        document.getElementById('addRowBtn').addEventListener('click', () => {
            this.addStudent();
        });
        
        document.getElementById('deleteRowBtn').addEventListener('click', () => {
            this.deleteSelectedStudent();
        });
        
        document.getElementById('generatePasswordBtn').addEventListener('click', () => {
            this.generateAllPasswords();
        });
        
        document.getElementById('exportStudentsBtn').addEventListener('click', () => {
            this.exportToCSV();
        });
        
        document.getElementById('importStudentsBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
        
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.importFromCSV(e);
        });
    }

    renderTable() {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        this.students.forEach((student, index) => {
            const row = this.createStudentRow(student, index);
            tbody.appendChild(row);
        });

        this.updateStudentCount();
    }

    createStudentRow(student, index) {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.dataset.index = index;
        
        row.addEventListener('click', () => {
            this.selectRow(row);
        });

        row.innerHTML = `
            <td class="excel-cell row-number">${index + 1}</td>
            <td class="excel-cell">
                <input type="text" value="${student.id}" 
                       class="w-full border-none bg-transparent focus:outline-none focus:bg-blue-50 p-1 rounded"
                       onchange="studentManager.updateStudent(${index}, 'id', this.value)"
                       placeholder="prénom.nom">
            </td>
            <td class="excel-cell">
                <select class="w-full border-none bg-transparent focus:outline-none focus:bg-blue-50 p-1 rounded"
                        onchange="studentManager.updateStudent(${index}, 'class', this.value)">
                    <option value="">Sélectionner</option>
                    ${this.getClassOptions(student.class)}
                </select>
            </td>
            <td class="excel-cell">
                <input type="text" value="${student.password}" 
                       class="w-full border-none bg-transparent focus:outline-none focus:bg-blue-50 p-1 rounded font-mono"
                       onchange="studentManager.updateStudent(${index}, 'password', this.value)"
                       placeholder="Mot de passe">
            </td>
            <td class="excel-cell">
                <input type="text" value="${student.secretCode || ''}" 
                       class="w-full border-none bg-transparent focus:outline-none focus:bg-blue-50 p-1 rounded font-mono text-green-600"
                       readonly
                       placeholder="Code généré automatiquement"
                       title="Code secret généré lors de la première connexion">
            </td>
            <td class="excel-cell">
                <div class="flex items-center space-x-2">
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                        ${this.getStudentReportsCount(student.id)}
                    </span>
                    <button onclick="studentManager.viewStudentReports('${student.id}')" 
                            class="text-blue-600 hover:text-blue-800 text-xs underline" 
                            title="Voir les signalements">
                        Détails
                    </button>
                </div>
            </td>
            <td class="excel-cell text-center">
                <button onclick="studentManager.generatePasswordForStudent(${index})" 
                        class="text-blue-600 hover:text-blue-800 mr-2" title="Générer mot de passe">
                    🔑
                </button>
                <button onclick="studentManager.deleteStudent(${index})" 
                        class="text-red-600 hover:text-red-800" title="Supprimer">
                    🗑️
                </button>
            </td>
        `;

        return row;
    }

    getClassOptions(selectedClass) {
        const classes = [];
        // Générer les classes de 6G1 à 6G9, 5G1 à 5G9, etc.
        for (let level of ['6', '5', '4', '3']) {
            for (let num = 1; num <= 9; num++) {
                classes.push(`${level}G${num}`);
            }
        }
        return classes.map(cls => 
            `<option value="${cls}" ${cls === selectedClass ? 'selected' : ''}>${cls}</option>`
        ).join('');
    }

    selectRow(row) {
        // Désélectionner la ligne précédente
        if (this.selectedRow) {
            this.selectedRow.classList.remove('selected-row');
        }
        
        // Sélectionner la nouvelle ligne
        row.classList.add('selected-row');
        this.selectedRow = row;
    }

    addStudent() {
        const newStudent = {
            id: '',
            class: '',
            password: '',
            secretCode: ''
        };
        
        this.students.push(newStudent);
        this.saveStudents();
        this.renderTable();
        this.updateStatistics();
        pageManager.showNotification('Nouvel élève ajouté', 'success');
    }

    deleteStudent(index) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet élève ?')) {
            this.students.splice(index, 1);
            this.saveStudents();
            this.renderTable();
            this.updateStatistics();
            pageManager.showNotification('Élève supprimé', 'success');
        }
    }

    deleteSelectedStudent() {
        if (!this.selectedRow) {
            pageManager.showNotification('Veuillez sélectionner une ligne à supprimer', 'error');
            return;
        }
        
        const index = parseInt(this.selectedRow.dataset.index);
        this.deleteStudent(index);
    }

    updateStudent(index, field, value) {
        if (this.students[index]) {
            this.students[index][field] = value.toLowerCase().trim();
            this.saveStudents();
            this.updateStatistics();
        }
    }

    generatePassword() {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    generatePasswordForStudent(index) {
        this.students[index].password = this.generatePassword();
        this.saveStudents();
        this.renderTable();
        pageManager.showNotification('Mot de passe généré', 'success');
    }

    generateAllPasswords() {
        if (confirm('Générer de nouveaux mots de passe pour tous les élèves ?')) {
            this.students.forEach(student => {
                student.password = this.generatePassword();
            });
            this.saveStudents();
            this.renderTable();
            pageManager.showNotification('Tous les mots de passe ont été régénérés', 'success');
        }
    }

    exportToCSV() {
        const headers = ['Identifiant', 'Classe', 'Mot de passe provisoire', 'Code secret'];
        const csvContent = [
            headers.join(','),
            ...this.students.map(student => 
                [student.id, student.class, student.password, student.secretCode || ''].join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eleves_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        pageManager.showNotification('Données exportées avec succès', 'success');
    }

    importFromCSV(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const lines = csv.split('\n');
                const students = [];

                // Ignorer la première ligne (en-têtes)
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line) {
                        const [id, className, password, secretCode] = line.split(',');
                        if (id && className && password) {
                            students.push({
                                id: id.trim(),
                                class: className.trim(),
                                password: password.trim(),
                                secretCode: secretCode ? secretCode.trim() : ''
                            });
                        }
                    }
                }

                if (students.length > 0) {
                    this.students = students;
                    this.saveStudents();
                    this.renderTable();
                    this.updateStatistics();
                    pageManager.showNotification(`${students.length} élèves importés`, 'success');
                }
            } catch (error) {
                pageManager.showNotification('Erreur lors de l\'importation', 'error');
            }
        };
        reader.readAsText(file);
        
        // Reset input
        event.target.value = '';
    }

    updateStudentCount() {
        document.getElementById('studentCount').textContent = this.students.length;
    }

    updateStatistics() {
        const stats = {
            '6': 0, '5': 0, '4': 0, '3': 0
        };

        this.students.forEach(student => {
            const level = student.class.charAt(0);
            if (stats.hasOwnProperty(level)) {
                stats[level]++;
            }
        });

        document.getElementById('count6').textContent = stats['6'];
        document.getElementById('count5').textContent = stats['5'];
        document.getElementById('count4').textContent = stats['4'];
        document.getElementById('count3').textContent = stats['3'];
    }

    getStudentReportsCount(studentId) {
        if (!window.reportSystem || !window.reportSystem.reports) {
            return 0;
        }
        return window.reportSystem.reports.filter(report => report.studentId === studentId).length;
    }

    viewStudentReports(studentId) {
        if (!window.reportSystem || !window.reportSystem.reports) {
            pageManager.showNotification('Aucun signalement trouvé', 'info');
            return;
        }

        const studentReports = window.reportSystem.reports.filter(report => report.studentId === studentId);
        
        if (studentReports.length === 0) {
            pageManager.showNotification(`Aucun signalement pour ${studentId}`, 'info');
            return;
        }

        this.showReportsModal(studentId, studentReports);
    }

    showReportsModal(studentId, reports) {
        // Créer la modal
        const modal = document.createElement('div');
        modal.id = 'studentReportsModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl m-4 max-h-screen overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800">Signalements de ${studentId}</h2>
                        <p class="text-gray-600">${reports.length} signalement(s) au total</p>
                    </div>
                    <button onclick="this.closest('#studentReportsModal').remove()" 
                            class="text-gray-500 hover:text-gray-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="space-y-4">
                    ${reports.map(report => this.createReportSummary(report)).join('')}
                </div>
                
                <div class="mt-6 flex justify-end">
                    <button onclick="this.closest('#studentReportsModal').remove()" 
                            class="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition duration-200">
                        Fermer
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    createReportSummary(report) {
        const statusColors = {
            'new': 'bg-red-100 text-red-800',
            'in-progress': 'bg-yellow-100 text-yellow-800',
            'resolved': 'bg-green-100 text-green-800'
        };

        const statusLabels = {
            'new': 'Nouveau',
            'in-progress': 'En cours',
            'resolved': 'Résolu'
        };

        const typeLabels = {
            'physical': 'Harcèlement physique',
            'verbal': 'Harcèlement verbal',
            'cyber': 'Cyber-harcèlement',
            'discrimination': 'Discrimination',
            'exclusion': 'Exclusion sociale',
            'other': 'Autre'
        };

        const roleLabels = {
            'victim': 'Victime',
            'witness': 'Témoin'
        };

        const frequencyLabels = {
            'first-time': 'Première fois',
            'occasional': 'Occasionnel',
            'frequent': 'Fréquent',
            'daily': 'Quotidien'
        };

        return `
            <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center space-x-2">
                        <span class="text-sm font-medium text-gray-500">#${report.id}</span>
                        <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusColors[report.status]}">
                            ${statusLabels[report.status]}
                        </span>
                    </div>
                    <span class="text-sm text-gray-500">
                        ${new Date(report.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                        <span class="text-xs font-medium text-gray-500">Type:</span>
                        <p class="text-sm text-gray-800">${typeLabels[report.type] || report.type}</p>
                    </div>
                    <div>
                        <span class="text-xs font-medium text-gray-500">Rôle:</span>
                        <p class="text-sm text-gray-800">${roleLabels[report.role] || report.role}</p>
                    </div>
                    <div>
                        <span class="text-xs font-medium text-gray-500">Lieu:</span>
                        <p class="text-sm text-gray-800">${report.location}</p>
                    </div>
                </div>
                
                <div class="mb-3">
                    <span class="text-xs font-medium text-gray-500">Description:</span>
                    <p class="text-sm text-gray-800 mt-1">${report.description}</p>
                </div>
                
                <div class="flex justify-between items-center text-xs text-gray-500">
                    <span>Fréquence: ${frequencyLabels[report.frequency] || report.frequency}</span>
                    <span>Classe: ${report.studentClass}</span>
                </div>
            </div>
        `;
    }
}

// Système de signalement
class ReportSystem {
    constructor() {
        this.reports = [];
        this.config = {};
        this.initializeEventListeners();
    }

    loadReports() {
        const encrypted = localStorage.getItem('encryptedReports');
        const decrypted = decryptData(encrypted, adminAuth.masterKey);
        if (decrypted) {
            this.reports = decrypted;
            return true;
        }
        if (!encrypted) {
            this.reports = [];
            return true;
        }
        return false;
    }

    loadConfig() {
        const encrypted = localStorage.getItem('pharConfig_encrypted');
        const decrypted = decryptData(encrypted, adminAuth.masterKey);
         if (decrypted) {
            this.config = decrypted;
            return true;
        }
        if (!encrypted) {
            this.config = { phone1: '', phone2: '', email1: '', email2: '' };
            return true;
        }
        return false;
    }

    saveReports() {
        const encrypted = encryptData(this.reports, adminAuth.masterKey);
        if(encrypted) {
            localStorage.setItem('encryptedReports', encrypted);
        }
    }

    saveConfig() {
        const encrypted = encryptData(this.config, adminAuth.masterKey);
        if(encrypted) {
            localStorage.setItem('pharConfig_encrypted', encrypted);
        }
    }

    initializeEventListeners() {
        document.getElementById('reportForm').addEventListener('submit', (e) => {
            this.handleReport(e);
        });
        
        document.getElementById('configBtn').addEventListener('click', () => {
            this.showConfigModal();
        });
        
        document.getElementById('closeConfigBtn').addEventListener('click', () => {
            this.hideConfigModal();
        });
        
        document.getElementById('cancelConfigBtn').addEventListener('click', () => {
            this.hideConfigModal();
        });
        
        document.getElementById('configForm').addEventListener('submit', (e) => {
            this.handleConfigSave(e);
        });
        
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });
        
        document.getElementById('generateReportBtn').addEventListener('click', () => {
            this.generateMonthlyReport();
        });
    }

    handleReport(e) {
        e.preventDefault();
        
        const reportData = {
            id: Date.now(),
            studentId: studentAuth.currentStudent.id,
            studentClass: studentAuth.currentStudent.class,
            type: document.getElementById('reportType').value,
            role: document.getElementById('reportRole').value,
            location: document.getElementById('reportLocation').value,
            description: document.getElementById('reportDescription').value,
            frequency: document.getElementById('reportFrequency').value,
            status: 'new',
            createdAt: new Date().toISOString()
        };
        
        this.reports.unshift(reportData);
        this.saveReports();
        
        // Simuler l'envoi de notifications
        this.sendNotifications(reportData);
        
        this.showReportMessage('Votre signalement a été envoyé avec succès. L\'équipe PHARE va le traiter rapidement.', 'success');
        
        // Réinitialiser le formulaire
        document.getElementById('reportForm').reset();
    }

    sendNotifications(reportData) {
        // Simulation d'envoi SMS et email
        console.log('Notification SMS envoyée aux numéros:', this.config.phone1, this.config.phone2);
        console.log('Notification email envoyée aux adresses:', this.config.email1, this.config.email2);
        console.log('Données du signalement:', reportData);
    }

    showConfigModal() {
        document.getElementById('phone1').value = this.config.phone1;
        document.getElementById('phone2').value = this.config.phone2;
        document.getElementById('email1').value = this.config.email1;
        document.getElementById('email2').value = this.config.email2;
        document.getElementById('configModal').classList.remove('hidden');
    }

    hideConfigModal() {
        document.getElementById('configModal').classList.add('hidden');
    }

    handleConfigSave(e) {
        e.preventDefault();
        
        this.config = {
            phone1: document.getElementById('phone1').value,
            phone2: document.getElementById('phone2').value,
            email1: document.getElementById('email1').value,
            email2: document.getElementById('email2').value
        };
        
        this.saveConfig();
        this.hideConfigModal();
        pageManager.showNotification('Configuration sauvegardée', 'success');
    }

    updateReportStatus(id, status) {
        const report = this.reports.find(r => r.id === id);
        if (report) {
            report.status = status;
            report.updatedAt = new Date().toISOString();
            this.saveReports();
            this.updateAdminDisplay();
        }
    }

    getStatistics() {
        return {
            new: this.reports.filter(r => r.status === 'new').length,
            inProgress: this.reports.filter(r => r.status === 'in-progress').length,
            resolved: this.reports.filter(r => r.status === 'resolved').length,
            total: this.reports.length
        };
    }

    updateAdminDisplay() {
        const stats = this.getStatistics();
        document.getElementById('newCount').textContent = stats.new;
        document.getElementById('inProgressCount').textContent = stats.inProgress;
        document.getElementById('resolvedCount').textContent = stats.resolved;
        document.getElementById('totalCount').textContent = stats.total;
        
        this.updateReportsList();
    }

    updateReportsList() {
        const reportsList = document.getElementById('reportsList');
        
        if (this.reports.length === 0) {
            reportsList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <p>Aucun signalement pour le moment</p>
                </div>
            `;
            return;
        }
        
        reportsList.innerHTML = this.reports.map(report => this.createReportCard(report)).join('');
    }

    createReportCard(report) {
        const statusBadge = this.getStatusBadge(report.status);
        const typeBadge = this.getTypeBadge(report.type);
        
        return `
            <div class="report-card bg-white border rounded-lg p-6 transition-all duration-200">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center space-x-2">
                        <span class="text-sm font-medium text-gray-500">#${report.id}</span>
                        ${statusBadge}
                        ${typeBadge}
                    </div>
                    <div class="text-sm text-gray-500">
                        ${new Date(report.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                </div>
                
                <div class="mb-4">
                    <div class="flex items-center space-x-4 mb-2">
                        <span class="text-sm text-gray-600">👤 ${report.studentId}</span>
                        <span class="text-sm text-gray-600">🏫 ${report.studentClass}</span>
                        <span class="text-sm text-gray-600">📍 ${report.location}</span>
                    </div>
                    <p class="text-gray-800 text-sm">${report.description}</p>
                </div>
                
                <div class="flex justify-between items-center">
                    <div class="text-sm text-gray-500">
                        ${report.role === 'victim' ? 'Victime' : 'Témoin'} - ${this.getFrequencyLabel(report.frequency)}
                    </div>
                    <select onchange="reportSystem.updateReportStatus(${report.id}, this.value)" class="text-sm px-3 py-1 border border-gray-300 rounded">
                        <option value="new" ${report.status === 'new' ? 'selected' : ''}>Nouveau</option>
                        <option value="in-progress" ${report.status === 'in-progress' ? 'selected' : ''}>En cours</option>
                        <option value="resolved" ${report.status === 'resolved' ? 'selected' : ''}>Résolu</option>
                    </select>
                </div>
            </div>
        `;
    }

    getStatusBadge(status) {
        const badges = {
            'new': '<span class="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Nouveau</span>',
            'in-progress': '<span class="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">En cours</span>',
            'resolved': '<span class="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Résolu</span>'
        };
        return badges[status] || '';
    }

    getTypeBadge(type) {
        const badges = {
            'physical': '<span class="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">Physique</span>',
            'verbal': '<span class="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">Verbal</span>',
            'cyber': '<span class="px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full">Cyber</span>',
            'discrimination': '<span class="px-2 py-1 text-xs font-semibold bg-pink-100 text-pink-800 rounded-full">Discrimination</span>',
            'exclusion': '<span class="px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded-full">Exclusion</span>',
            'other': '<span class="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">Autre</span>'
        };
        return badges[type] || '';
    }

    getFrequencyLabel(frequency) {
        const labels = {
            'first-time': 'Première fois',
            'occasional': 'Occasionnel',
            'frequent': 'Fréquent',
            'daily': 'Quotidien'
        };
        return labels[frequency] || frequency;
    }

    showReportMessage(message, type) {
        const element = document.getElementById('reportMessage');
        element.textContent = message;
        element.className = `mt-4 p-3 rounded-lg text-center ${
            type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`;
        element.classList.remove('hidden');
        
        setTimeout(() => {
            element.classList.add('hidden');
        }, 5000);
    }

    exportData() {
        const data = {
            reports: this.reports,
            exportDate: new Date().toISOString(),
            statistics: this.getStatistics()
        };
        
        const csvContent = this.convertToCSV(this.reports);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `signalements_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        pageManager.showNotification('Données exportées avec succès', 'success');
    }

    convertToCSV(reports) {
        const headers = ['ID', 'Élève', 'Classe', 'Type', 'Rôle', 'Lieu', 'Description', 'Fréquence', 'Statut', 'Date'];
        const rows = reports.map(report => [
            report.id,
            report.studentId,
            report.studentClass,
            report.type,
            report.role,
            report.location,
            `"${report.description.replace(/"/g, '""')}"`,
            report.frequency,
            report.status,
            new Date(report.createdAt).toLocaleDateString('fr-FR')
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    generateMonthlyReport() {
        const stats = this.getStatistics();
        const reportContent = `
RAPPORT MENSUEL - PLATEFORME ANTI-HARCÈLEMENT
Collège Louis Pasteur
=============================================

Date: ${new Date().toLocaleDateString('fr-FR')}

STATISTIQUES GÉNÉRALES:
- Total des signalements: ${stats.total}
- Nouveaux signalements: ${stats.new}
- Signalements en cours: ${stats.inProgress}
- Signalements résolus: ${stats.resolved}

TAUX DE RÉSOLUTION: ${stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%

RÉPARTITION PAR TYPE:
${this.getTypeStatistics()}

RÉPARTITION PAR CLASSE:
${this.getClassStatistics()}
                `;
        
        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport_mensuel_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        pageManager.showNotification('Rapport mensuel généré', 'success');
    }

    getTypeStatistics() {
        const types = {};
        this.reports.forEach(report => {
            types[report.type] = (types[report.type] || 0) + 1;
        });
        return Object.entries(types).map(([type, count]) => `- ${type}: ${count}`).join('\n');
    }

    getClassStatistics() {
        const classes = {};
        this.reports.forEach(report => {
            classes[report.studentClass] = (classes[report.studentClass] || 0) + 1;
        });
        return Object.entries(classes).map(([cls, count]) => `- ${cls}: ${count}`).join('\n');
    }
}

// Authentification admin
class AdminAuth {
    constructor() {
        this.masterKey = null; // Stocke la clé de session
        this.masterPasswordHash = localStorage.getItem('masterPasswordHash');
        this.initializeEventListeners();
        this.checkSetup();
    }

    checkSetup() {
        if (this.masterPasswordHash) {
            document.getElementById('adminLoginContainer').classList.remove('hidden');
            document.getElementById('adminSetupContainer').classList.add('hidden');
        } else {
            document.getElementById('adminLoginContainer').classList.add('hidden');
            document.getElementById('adminSetupContainer').classList.remove('hidden');
        }
    }

    initializeEventListeners() {
        document.getElementById('loginAdminBtn').addEventListener('click', () => this.handleLogin());
        document.getElementById('adminCode').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });
        document.getElementById('setupAdminBtn').addEventListener('click', () => this.handleSetup());
    }

    handleSetup() {
        const newPassword = document.getElementById('newMasterPassword').value;
        const confirmPassword = document.getElementById('confirmMasterPassword').value;
        const errorDiv = document.getElementById('adminSetupError');

        if (newPassword.length < 8) {
            errorDiv.textContent = 'Le mot de passe doit faire au moins 8 caractères.';
            errorDiv.classList.remove('hidden');
            return;
        }

        if (newPassword !== confirmPassword) {
            errorDiv.textContent = 'Les mots de passe ne correspondent pas.';
            errorDiv.classList.remove('hidden');
            return;
        }

        this.masterPasswordHash = CryptoJS.SHA256(newPassword).toString();
        localStorage.setItem('masterPasswordHash', this.masterPasswordHash);
        
        // Le mot de passe lui-même devient la clé pour cette session
        this.masterKey = newPassword;

        // Initialiser les données avec la nouvelle clé
        studentManager.loadStudents();
        reportSystem.loadReports();
        reportSystem.loadConfig();

        pageManager.showNotification('Configuration réussie ! Vous êtes maintenant connecté.', 'success');
        pageManager.showPage('adminPanel');
        reportSystem.updateAdminDisplay();
    }

    handleLogin() {
        const inputCode = document.getElementById('adminCode').value;
        const errorDiv = document.getElementById('adminLoginError');
        
        const inputHash = CryptoJS.SHA256(inputCode).toString();

        if (inputHash === this.masterPasswordHash) {
            this.masterKey = inputCode; // La clé est le mot de passe pour la session
            
            // Charger les données chiffrées avec la clé
            const loadSuccess = reportSystem.loadReports() && studentManager.loadStudents() && reportSystem.loadConfig();

            if(loadSuccess) {
                pageManager.showPage('adminPanel');
                reportSystem.updateAdminDisplay();
                document.getElementById('adminCode').value = '';
                errorDiv.classList.add('hidden');
            } else {
                 errorDiv.textContent = 'Mot de passe incorrect ou données corrompues.';
                 errorDiv.classList.remove('hidden');
                 this.masterKey = null; // Invalider la clé
            }
        } else {
            errorDiv.textContent = 'Mot de passe incorrect. Veuillez réessayer.';
            errorDiv.classList.remove('hidden');
        }
    }

    logout() {
        this.masterKey = null;
        pageManager.showPage('homePage');
    }
}

// Initialisation
let pageManager, studentAuth, reportSystem, adminAuth, studentManager;

document.addEventListener('DOMContentLoaded', function() {
    try {
        pageManager = new PageManager();
        studentAuth = new StudentAuth();
        reportSystem = new ReportSystem();
        adminAuth = new AdminAuth();
        studentManager = new StudentManager();
        
        // Rendre accessible globalement pour les événements inline
        window.reportSystem = reportSystem;
        window.studentManager = studentManager;
        window.pageManager = pageManager;
        
        console.log('Application initialisée avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
    }
});

// Raccourcis clavier pour la gestion des élèves
document.addEventListener('keydown', function(e) {
    if (pageManager && pageManager.currentPage === 'studentManagement') {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 's':
                    e.preventDefault();
                    if (studentManager) {
                        studentManager.saveStudents();
                        pageManager.showNotification('Données sauvegardées', 'success');
                    }
                    break;
                case 'n':
                    e.preventDefault();
                    if (studentManager) {
                        studentManager.addStudent();
                    }
                    break;
                case 'e':
                    e.preventDefault();
                    if (studentManager) {
                        studentManager.exportToCSV();
                    }
                    break;
            }
        }
        
        if (e.key === 'Delete' && studentManager && studentManager.selectedRow) {
            studentManager.deleteSelectedStudent();
        }
    }
});
