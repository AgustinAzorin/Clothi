class AuthFrontend {
    constructor() {
        this.apiBaseUrl = 'https://clothi.online';
        this.accessToken = localStorage.getItem('accessToken') || null;
        this.refreshToken = localStorage.getItem('refreshToken') || null;
        this.user = JSON.parse(localStorage.getItem('user')) || null;
        
        this.initElements();
        this.bindEvents();
        this.updateAuthStatus();
    }

    initElements() {
        // Forms
        this.loginForm = document.getElementById('loginFormElement');
        this.signupForm = document.getElementById('signupFormElement');
        this.showSignupBtn = document.getElementById('showSignup');
        this.showLoginBtn = document.getElementById('showLogin');
        
        // Status
        this.authStatus = document.getElementById('authStatus');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.userInfo = document.getElementById('userInfo');
        this.userId = document.getElementById('userId');
        this.userEmail = document.getElementById('userEmail');
        
        // Actions
        this.actionsContainer = document.getElementById('actionsContainer');
        this.getUserInfoBtn = document.getElementById('getUserInfoBtn');
        this.getSessionsBtn = document.getElementById('getSessionsBtn');
        this.refreshTokenBtn = document.getElementById('refreshTokenBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        
        // Console
        this.console = document.getElementById('console');
        this.clearConsoleBtn = document.getElementById('clearConsole');
        this.apiBaseUrlInput = document.getElementById('apiBaseUrl');
        this.updateApiUrlBtn = document.getElementById('updateApiUrl');
        
        // Tokens
        this.tokensContainer = document.getElementById('tokensContainer');
        this.accessTokenDisplay = document.getElementById('accessTokenDisplay');
        this.refreshTokenDisplay = document.getElementById('refreshTokenDisplay');
        this.toggleTokensBtn = document.getElementById('toggleTokens');
        this.copyAccessTokenBtn = document.getElementById('copyAccessToken');
        
        this.tokensVisible = false;
    }

    bindEvents() {
        // Form toggles
        this.showSignupBtn.addEventListener('click', () => this.toggleForms('signup'));
        this.showLoginBtn.addEventListener('click', () => this.toggleForms('login'));
        
        // Form submissions
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        
        // Actions
        this.getUserInfoBtn.addEventListener('click', () => this.getUserInfo());
        this.getSessionsBtn.addEventListener('click', () => this.getSessions());
        this.refreshTokenBtn.addEventListener('click', () => this.refreshToken());
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
        
        // Console controls
        this.clearConsoleBtn.addEventListener('click', () => this.clearConsole());
        this.updateApiUrlBtn.addEventListener('click', () => this.updateApiBaseUrl());
        
        // Token controls
        this.toggleTokensBtn.addEventListener('click', () => this.toggleTokensVisibility());
        this.copyAccessTokenBtn.addEventListener('click', () => this.copyAccessToken());
        
        // Set initial API URL
        this.apiBaseUrlInput.value = this.apiBaseUrl;
    }

    toggleForms(form) {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        
        if (form === 'signup') {
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
        } else {
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            this.logToConsole('Por favor completa todos los campos', 'error');
            return;
        }
        
        try {
            this.logToConsole('Enviando solicitud de login...', 'info');
            
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    device: navigator.userAgent,
                    ip: '127.0.0.1' // Para pruebas
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.accessToken = data.data?.accessToken || data.accessToken;
                this.refreshToken = data.data?.refreshToken || data.refreshToken;
                this.user = {
                    id: data.data?.userId || data.userId,
                    email: data.data?.email || email
                };
                
                // Guardar en localStorage
                localStorage.setItem('accessToken', this.accessToken);
                localStorage.setItem('refreshToken', this.refreshToken);
                localStorage.setItem('user', JSON.stringify(this.user));
                
                this.logToConsole('✅ Login exitoso!', 'success');
                this.logToConsole(`Usuario: ${this.user.email}`, 'info');
                
                this.updateAuthStatus();
                this.updateTokenDisplay();
                
                // Limpiar formulario
                document.getElementById('loginEmail').value = '';
                document.getElementById('loginPassword').value = '';
                
            } else {
                throw new Error(data.error || data.message || 'Error en login');
            }
            
        } catch (error) {
            this.logToConsole(`❌ Error en login: ${error.message}`, 'error');
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const fullName = document.getElementById('signupFullName').value;
        const phone = document.getElementById('signupPhone').value;
        
        if (!email || !password) {
            this.logToConsole('Email y contraseña son requeridos', 'error');
            return;
        }
        
        try {
            this.logToConsole('Creando nueva cuenta...', 'info');
            
            const response = await fetch(`${this.apiBaseUrl}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    full_name: fullName || null,
                    phone: phone || null,
                    roles: ['user'] // Rol por defecto
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.logToConsole('✅ Cuenta creada exitosamente!', 'success');
                this.logToConsole(`Usuario ID: ${data.data?.user?.id || 'N/A'}`, 'info');
                
                // Auto-login después del signup
                document.getElementById('loginEmail').value = email;
                document.getElementById('loginPassword').value = password;
                this.toggleForms('login');
                
            } else {
                throw new Error(data.error || data.message || 'Error en registro');
            }
            
        } catch (error) {
            this.logToConsole(`❌ Error en registro: ${error.message}`, 'error');
        }
    }

    async getUserInfo() {
        if (!this.accessToken) {
            this.logToConsole('No estás autenticado', 'error');
            return;
        }
        
        try {
            this.logToConsole('Obteniendo información del usuario...', 'info');
            
            const response = await fetch(`${this.apiBaseUrl}/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.logToConsole('✅ Información del usuario:', 'success');
                this.logToConsole(JSON.stringify(data, null, 2), 'info');
                
                // Actualizar datos del usuario
                if (data.data) {
                    this.user = data.data;
                    localStorage.setItem('user', JSON.stringify(this.user));
                    this.updateAuthStatus();
                }
                
            } else {
                if (response.status === 401) {
                    this.logToConsole('Token expirado, intentando refresh...', 'warning');
                    await this.refreshToken();
                    await this.getUserInfo(); // Reintentar
                } else {
                    throw new Error(data.error || data.message || 'Error obteniendo info');
                }
            }
            
        } catch (error) {
            this.logToConsole(`❌ Error: ${error.message}`, 'error');
        }
    }

    async getSessions() {
        if (!this.accessToken) {
            this.logToConsole('No estás autenticado', 'error');
            return;
        }
        
        try {
            this.logToConsole('Obteniendo sesiones activas...', 'info');
            
            const response = await fetch(`${this.apiBaseUrl}/sessions`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.logToConsole('✅ Sesiones activas:', 'success');
                
                if (data.data && data.data.length > 0) {
                    data.data.forEach((session, index) => {
                        this.logToConsole(
                            `${index + 1}. ${session.device || 'Dispositivo desconocido'} - ` +
                            `IP: ${session.ip_address || 'N/A'} - ` +
                            `Creada: ${new Date(session.created_at).toLocaleString()}`,
                            'info'
                        );
                    });
                } else {
                    this.logToConsole('No hay sesiones activas', 'info');
                }
                
            } else {
                if (response.status === 401) {
                    this.logToConsole('Token expirado, intentando refresh...', 'warning');
                    await this.refreshToken();
                    await this.getSessions(); // Reintentar
                } else {
                    throw new Error(data.error || data.message || 'Error obteniendo sesiones');
                }
            }
            
        } catch (error) {
            this.logToConsole(`❌ Error: ${error.message}`, 'error');
        }
    }

    async refreshToken() {
        if (!this.refreshToken) {
            this.logToConsole('No hay refresh token disponible', 'error');
            return;
        }
        
        try {
            this.logToConsole('Refrescando token...', 'info');
            
            const response = await fetch(`${this.apiBaseUrl}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refreshToken: this.refreshToken
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.accessToken = data.data?.accessToken || data.accessToken;
                this.refreshToken = data.data?.refreshToken || data.refreshToken;
                
                localStorage.setItem('accessToken', this.accessToken);
                localStorage.setItem('refreshToken', this.refreshToken);
                
                this.logToConsole('✅ Token refrescado exitosamente!', 'success');
                this.updateTokenDisplay();
                
            } else {
                // Si el refresh token falla, hacer logout
                this.logToConsole('Refresh token inválido, cerrando sesión...', 'error');
                this.handleLogout();
                throw new Error(data.error || data.message || 'Error refrescando token');
            }
            
        } catch (error) {
            this.logToConsole(`❌ Error: ${error.message}`, 'error');
        }
    }

    async handleLogout() {
        if (!this.accessToken) {
            this.logToConsole('No estás autenticado', 'error');
            return;
        }
        
        try {
            this.logToConsole('Cerrando sesión...', 'info');
            
            const response = await fetch(`${this.apiBaseUrl}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.clearAuthData();
                this.logToConsole('✅ Sesión cerrada exitosamente', 'success');
                this.updateAuthStatus();
                
            } else {
                // Aún así limpiamos los datos locales
                this.clearAuthData();
                this.logToConsole('Sesión cerrada localmente', 'info');
            }
            
        } catch (error) {
            // Aún así limpiamos los datos locales
            this.clearAuthData();
            this.logToConsole('Sesión cerrada localmente', 'info');
        }
    }

    clearAuthData() {
        this.accessToken = null;
        this.refreshToken = null;
        this.user = null;
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        this.updateAuthStatus();
        this.updateTokenDisplay();
    }

    updateAuthStatus() {
        if (this.accessToken && this.user) {
            this.authStatus.classList.add('authenticated');
            this.statusText.textContent = `Autenticado como: ${this.user.email}`;
            this.userInfo.style.display = 'block';
            this.userId.textContent = this.user.id?.substring(0, 8) + '...' || 'N/A';
            this.userEmail.textContent = this.user.email || 'N/A';
            this.actionsContainer.style.display = 'block';
            this.tokensContainer.style.display = 'block';
            
            // Mostrar formulario de login por defecto
            this.toggleForms('login');
        } else {
            this.authStatus.classList.remove('authenticated');
            this.statusText.textContent = 'No autenticado';
            this.userInfo.style.display = 'none';
            this.actionsContainer.style.display = 'none';
            this.tokensContainer.style.display = 'none';
        }
    }

    updateTokenDisplay() {
        if (this.accessToken) {
            const displayToken = this.tokensVisible 
                ? this.accessToken 
                : `${this.accessToken.substring(0, 30)}...`;
            this.accessTokenDisplay.textContent = displayToken;
        } else {
            this.accessTokenDisplay.textContent = 'No disponible';
        }
        
        if (this.refreshToken) {
            const displayToken = this.tokensVisible
                ? this.refreshToken
                : `${this.refreshToken.substring(0, 30)}...`;
            this.refreshTokenDisplay.textContent = displayToken;
        } else {
            this.refreshTokenDisplay.textContent = 'No disponible';
        }
    }

    toggleTokensVisibility() {
        this.tokensVisible = !this.tokensVisible;
        this.updateTokenDisplay();
        this.toggleTokensBtn.innerHTML = this.tokensVisible 
            ? '<i class="fas fa-eye-slash"></i> Ocultar Tokens'
            : '<i class="fas fa-eye"></i> Mostrar Tokens';
    }

    copyAccessToken() {
        if (!this.accessToken) {
            this.logToConsole('No hay access token para copiar', 'error');
            return;
        }
        
        navigator.clipboard.writeText(this.accessToken)
            .then(() => {
                this.logToConsole('✅ Access Token copiado al portapapeles', 'success');
                this.copyAccessTokenBtn.innerHTML = '<i class="fas fa-check"></i> ¡Copiado!';
                setTimeout(() => {
                    this.copyAccessTokenBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar Access Token';
                }, 2000);
            })
            .catch(err => {
                this.logToConsole(`❌ Error copiando token: ${err.message}`, 'error');
            });
    }

    updateApiBaseUrl() {
        const newUrl = this.apiBaseUrlInput.value.trim();
        if (newUrl) {
            this.apiBaseUrl = newUrl;
            this.logToConsole(`✅ URL de API actualizada a: ${this.apiBaseUrl}`, 'success');
        }
    }

    logToConsole(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;
        
        this.console.appendChild(logEntry);
        this.console.scrollTop = this.console.scrollHeight;
    }

    clearConsole() {
        this.console.innerHTML = '<div class="log-entry">Consola limpiada</div>';
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.authApp = new AuthFrontend();
    
    // Mostrar información inicial
    window.authApp.logToConsole('✅ Frontend de pruebas cargado', 'success');
    window.authApp.logToConsole(`API Base: ${window.authApp.apiBaseUrl}`, 'info');
    
    if (window.authApp.accessToken) {
        window.authApp.logToConsole('Sesión recuperada de localStorage', 'info');
    }
});