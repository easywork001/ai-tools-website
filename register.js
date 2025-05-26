// 注册页面JavaScript功能
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordStrength = document.getElementById('passwordStrength');
    const captchaCanvas = document.getElementById('captchaCanvas');
    const refreshCaptcha = document.getElementById('refreshCaptcha');
    const registerBtn = document.getElementById('registerBtn');

    let currentCaptcha = '';

    // 初始化验证码
    generateCaptcha();

    // 密码显示/隐藏切换
    passwordToggle.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const eyeIcon = this.querySelector('.eye-icon');
        eyeIcon.textContent = type === 'password' ? '👁️' : '🙈';
    });

    // 密码强度检测
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = calculatePasswordStrength(password);
        updatePasswordStrength(strength);
    });

    // 确认密码验证
    confirmPasswordInput.addEventListener('input', function() {
        validatePasswordMatch();
    });

    // 验证码刷新
    refreshCaptcha.addEventListener('click', generateCaptcha);
    captchaCanvas.addEventListener('click', generateCaptcha);

    // 表单提交
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitForm();
        }
    });

    // 实时验证
    const inputs = registerForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearError(this);
        });
    });

    // 生成验证码
    function generateCaptcha() {
        const canvas = captchaCanvas;
        const ctx = canvas.getContext('2d');
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 生成随机验证码
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        currentCaptcha = '';
        for (let i = 0; i < 4; i++) {
            currentCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // 设置背景
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 添加干扰线
        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
        }
        
        // 绘制验证码文字
        ctx.font = '20px Arial';
        ctx.textBaseline = 'middle';
        
        for (let i = 0; i < currentCaptcha.length; i++) {
            ctx.fillStyle = `rgb(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100})`;
            ctx.save();
            ctx.translate(20 + i * 20, canvas.height / 2);
            ctx.rotate((Math.random() - 0.5) * 0.5);
            ctx.fillText(currentCaptcha[i], 0, 0);
            ctx.restore();
        }
        
        // 添加干扰点
        for (let i = 0; i < 20; i++) {
            ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    // 计算密码强度
    function calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        
        return Math.min(score, 4);
    }

    // 更新密码强度显示
    function updatePasswordStrength(strength) {
        const strengthFill = passwordStrength.querySelector('.strength-fill');
        const strengthText = passwordStrength.querySelector('.strength-text');
        
        const levels = ['', 'weak', 'fair', 'good', 'strong'];
        const texts = ['', '弱', '一般', '良好', '强'];
        
        strengthFill.className = `strength-fill ${levels[strength]}`;
        strengthText.textContent = `密码强度: ${texts[strength]}`;
    }

    // 验证密码匹配
    function validatePasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword && password !== confirmPassword) {
            showError('confirmPasswordError', '两次输入的密码不一致');
            return false;
        } else {
            clearError(confirmPasswordInput);
            return true;
        }
    }

    // 验证单个字段
    function validateField(field) {
        const value = field.value.trim();
        const name = field.name;
        
        switch (name) {
            case 'username':
                if (!value) {
                    showError('usernameError', '请输入用户名');
                    return false;
                } else if (value.length < 3) {
                    showError('usernameError', '用户名至少3个字符');
                    return false;
                } else if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(value)) {
                    showError('usernameError', '用户名只能包含字母、数字、下划线和中文');
                    return false;
                }
                break;
                
            case 'email':
                if (!value) {
                    showError('emailError', '请输入邮箱地址');
                    return false;
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    showError('emailError', '请输入有效的邮箱地址');
                    return false;
                }
                break;
                
            case 'phone':
                if (!value) {
                    showError('phoneError', '请输入手机号码');
                    return false;
                } else if (!/^1[3-9]\d{9}$/.test(value)) {
                    showError('phoneError', '请输入有效的手机号码');
                    return false;
                }
                break;
                
            case 'password':
                if (!value) {
                    showError('passwordError', '请输入密码');
                    return false;
                } else if (value.length < 6) {
                    showError('passwordError', '密码至少6个字符');
                    return false;
                }
                break;
                
            case 'confirmPassword':
                return validatePasswordMatch();
                
            case 'captcha':
                if (!value) {
                    showError('captchaError', '请输入验证码');
                    return false;
                } else if (value.toLowerCase() !== currentCaptcha.toLowerCase()) {
                    showError('captchaError', '验证码错误');
                    return false;
                }
                break;
        }
        
        clearError(field);
        return true;
    }

    // 验证整个表单
    function validateForm() {
        let isValid = true;
        
        // 验证所有输入字段
        const requiredFields = ['username', 'email', 'phone', 'password', 'confirmPassword', 'captcha'];
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        // 验证用户协议
        const agreement = document.getElementById('agreement');
        if (!agreement.checked) {
            showError('agreementError', '请阅读并同意用户协议和隐私政策');
            isValid = false;
        } else {
            clearError(agreement);
        }
        
        return isValid;
    }

    // 显示错误信息
    function showError(errorId, message) {
        const errorElement = document.getElementById(errorId);
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    // 清除错误信息
    function clearError(field) {
        const errorId = field.name + 'Error';
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    // 提交表单
    function submitForm() {
        const btnText = registerBtn.querySelector('.btn-text');
        const btnLoading = registerBtn.querySelector('.btn-loading');
        
        // 显示加载状态
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-flex';
        registerBtn.disabled = true;
        
        // 收集表单数据
        const formData = new FormData(registerForm);
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password'),
            newsletter: formData.get('newsletter') === 'on'
        };
        
        // 模拟API请求
        setTimeout(() => {
            // 这里应该是实际的API调用
            console.log('注册数据:', userData);
            
            // 模拟成功响应
            showSuccessMessage('注册成功！正在跳转到登录页面...');
            
            // 跳转到登录页面
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        }, 2000);
    }

    // 显示成功信息
    function showSuccessMessage(message) {
        // 创建成功提示元素
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message show';
        successDiv.textContent = message;
        
        // 插入到表单前面
        registerForm.parentNode.insertBefore(successDiv, registerForm);
        
        // 隐藏表单
        registerForm.style.display = 'none';
    }

    // 社交登录按钮事件
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const platform = this.textContent.trim().replace('注册', '');
            console.log(`使用${platform}注册`);
            
            // 这里可以添加第三方登录的逻辑
            alert(`${platform}注册功能开发中...`);
        });
    });

    // 键盘事件
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
            const form = e.target.closest('form');
            if (form === registerForm) {
                e.preventDefault();
                registerForm.dispatchEvent(new Event('submit'));
            }
        }
    });

    // 页面离开前提醒
    let formChanged = false;
    registerForm.addEventListener('input', function() {
        formChanged = true;
    });

    window.addEventListener('beforeunload', function(e) {
        if (formChanged && !registerBtn.disabled) {
            e.preventDefault();
            e.returnValue = '您有未保存的注册信息，确定要离开吗？';
        }
    });
});

// 工具函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 邮箱验证增强
function validateEmailDomain(email) {
    const commonDomains = ['gmail.com', 'qq.com', '163.com', '126.com', 'sina.com', 'hotmail.com', 'outlook.com'];
    const domain = email.split('@')[1];
    return commonDomains.includes(domain);
}

// 密码安全建议
function getPasswordSuggestions(password) {
    const suggestions = [];
    
    if (password.length < 8) {
        suggestions.push('密码长度至少8位');
    }
    if (!/[a-z]/.test(password)) {
        suggestions.push('包含小写字母');
    }
    if (!/[A-Z]/.test(password)) {
        suggestions.push('包含大写字母');
    }
    if (!/[0-9]/.test(password)) {
        suggestions.push('包含数字');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        suggestions.push('包含特殊字符');
    }
    
    return suggestions;
} 