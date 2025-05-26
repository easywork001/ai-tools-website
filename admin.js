// 管理员后台脚本
class AdminPanel {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.newsData = [];
        this.filteredNews = [];
        this.currentEditId = null;
        
        this.init();
    }

    init() {
        this.loadNewsData();
        this.bindEvents();
        this.updateStats();
        this.renderNewsTable();
        this.checkAdminAuth();
    }

    // 检查管理员权限
    checkAdminAuth() {
        const adminToken = localStorage.getItem('adminToken');
        const adminUser = localStorage.getItem('adminUser');
        
        if (!adminToken || !adminUser) {
            window.location.href = 'login.html?admin=true';
            return;
        }

        // 验证token有效性
        try {
            const tokenData = JSON.parse(atob(adminToken.split('.')[1]));
            if (tokenData.exp < Date.now() / 1000) {
                this.logout();
                return;
            }
            
            if (tokenData.role !== 'admin') {
                alert('权限不足，需要管理员权限');
                window.location.href = 'index.html';
                return;
            }

            document.getElementById('adminName').textContent = adminUser;
        } catch (error) {
            console.error('Token验证失败:', error);
            this.logout();
        }
    }

    // 绑定事件
    bindEvents() {
        // 导航菜单切换
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('a').dataset.section;
                this.switchSection(section);
            });
        });

        // 筛选器事件
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterNews());
        document.getElementById('statusFilter').addEventListener('change', () => this.filterNews());
        document.getElementById('dateFilter').addEventListener('change', () => this.filterNews());

        // 全选checkbox
        document.getElementById('selectAll').addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.news-checkbox');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
        });

        // 分页按钮
        document.getElementById('prevPage').addEventListener('click', () => this.changePage(-1));
        document.getElementById('nextPage').addEventListener('click', () => this.changePage(1));

        // 移动端菜单切换
        document.querySelector('.menu-toggle').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('open');
        });

        // 图片预览
        document.getElementById('newsImage').addEventListener('change', (e) => {
            this.previewImage(e.target.files[0]);
        });

        // 模态框外部点击关闭
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeNewsModal();
                this.closeConfirmModal();
            }
        });
    }

    // 切换页面部分
    switchSection(section) {
        // 更新导航状态
        document.querySelectorAll('.nav-menu li').forEach(li => li.classList.remove('active'));
        document.querySelector(`[data-section="${section}"]`).parentElement.classList.add('active');

        // 切换内容区域
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(`${section}-section`).classList.add('active');

        // 更新页面标题
        const titles = {
            news: '每日AI快讯管理',
            tools: '工具管理',
            users: '用户管理',
            settings: '系统设置'
        };
        document.getElementById('pageTitle').textContent = titles[section];
    }

    // 加载新闻数据
    loadNewsData() {
        const savedNews = localStorage.getItem('aiNewsData');
        if (savedNews) {
            this.newsData = JSON.parse(savedNews);
        } else {
            // 初始化示例数据
            this.newsData = [
                {
                    id: 1,
                    title: 'OpenAI发布GPT-4 Turbo新版本',
                    category: 'AI工具',
                    content: 'OpenAI今日发布了GPT-4 Turbo的最新版本，性能提升显著，成本降低50%。',
                    url: 'https://openai.com',
                    tags: ['OpenAI', 'GPT-4', '更新'],
                    status: 'published',
                    publishTime: new Date().toISOString(),
                    views: 1250,
                    likes: 89,
                    image: ''
                },
                {
                    id: 2,
                    title: 'Google Bard集成Gemini Pro模型',
                    category: '技术更新',
                    content: 'Google宣布Bard聊天机器人现已集成最新的Gemini Pro模型，提供更强大的多模态能力。',
                    url: 'https://bard.google.com',
                    tags: ['Google', 'Bard', 'Gemini'],
                    status: 'published',
                    publishTime: new Date(Date.now() - 86400000).toISOString(),
                    views: 980,
                    likes: 67,
                    image: ''
                }
            ];
            this.saveNewsData();
        }
        this.filteredNews = [...this.newsData];
    }

    // 保存新闻数据
    saveNewsData() {
        localStorage.setItem('aiNewsData', JSON.stringify(this.newsData));
        // 同时更新前端展示数据
        localStorage.setItem('dailyAINews', JSON.stringify(this.newsData.filter(news => news.status === 'published')));
    }

    // 更新统计数据
    updateStats() {
        const total = this.newsData.length;
        const today = new Date().toDateString();
        const todayCount = this.newsData.filter(news => 
            new Date(news.publishTime).toDateString() === today
        ).length;
        const totalViews = this.newsData.reduce((sum, news) => sum + (news.views || 0), 0);
        const totalLikes = this.newsData.reduce((sum, news) => sum + (news.likes || 0), 0);

        document.getElementById('totalNews').textContent = total;
        document.getElementById('todayNews').textContent = todayCount;
        document.getElementById('totalViews').textContent = totalViews.toLocaleString();
        document.getElementById('totalLikes').textContent = totalLikes.toLocaleString();
    }

    // 筛选新闻
    filterNews() {
        const category = document.getElementById('categoryFilter').value;
        const status = document.getElementById('statusFilter').value;
        const date = document.getElementById('dateFilter').value;

        this.filteredNews = this.newsData.filter(news => {
            const categoryMatch = !category || news.category === category;
            const statusMatch = !status || news.status === status;
            const dateMatch = !date || new Date(news.publishTime).toDateString() === new Date(date).toDateString();
            
            return categoryMatch && statusMatch && dateMatch;
        });

        this.currentPage = 1;
        this.renderNewsTable();
    }

    // 渲染新闻表格
    renderNewsTable() {
        const tbody = document.getElementById('newsTableBody');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = this.filteredNews.slice(startIndex, endIndex);

        tbody.innerHTML = pageData.map(news => `
            <tr>
                <td><input type="checkbox" class="news-checkbox" data-id="${news.id}"></td>
                <td>
                    <div class="news-title">
                        <strong>${news.title}</strong>
                        ${news.tags ? `<div class="news-tags">${news.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
                    </div>
                </td>
                <td><span class="category-badge">${news.category}</span></td>
                <td>${new Date(news.publishTime).toLocaleString('zh-CN')}</td>
                <td><span class="status-badge status-${news.status}">${this.getStatusText(news.status)}</span></td>
                <td>${(news.views || 0).toLocaleString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-btn" onclick="adminPanel.viewNews(${news.id})" title="查看">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit-btn" onclick="adminPanel.editNews(${news.id})" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="adminPanel.deleteNews(${news.id})" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.renderPagination();
    }

    // 渲染分页
    renderPagination() {
        const totalPages = Math.ceil(this.filteredNews.length / this.itemsPerPage);
        const pageNumbers = document.getElementById('pageNumbers');
        
        // 更新按钮状态
        document.getElementById('prevPage').disabled = this.currentPage === 1;
        document.getElementById('nextPage').disabled = this.currentPage === totalPages;

        // 生成页码
        let pagesHtml = '';
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            pagesHtml += `
                <button class="page-number ${i === this.currentPage ? 'active' : ''}" 
                        onclick="adminPanel.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        pageNumbers.innerHTML = pagesHtml;
    }

    // 获取状态文本
    getStatusText(status) {
        const statusMap = {
            published: '已发布',
            draft: '草稿',
            archived: '已归档'
        };
        return statusMap[status] || status;
    }

    // 分页操作
    changePage(direction) {
        const totalPages = Math.ceil(this.filteredNews.length / this.itemsPerPage);
        const newPage = this.currentPage + direction;
        
        if (newPage >= 1 && newPage <= totalPages) {
            this.currentPage = newPage;
            this.renderNewsTable();
        }
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderNewsTable();
    }

    // 显示添加新闻模态框
    showAddNewsModal() {
        this.currentEditId = null;
        document.getElementById('modalTitle').textContent = '添加快讯';
        document.getElementById('newsForm').reset();
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('newsModal').classList.add('show');
    }

    // 编辑新闻
    editNews(id) {
        const news = this.newsData.find(n => n.id === id);
        if (!news) return;

        this.currentEditId = id;
        document.getElementById('modalTitle').textContent = '编辑快讯';
        
        // 填充表单
        document.getElementById('newsTitle').value = news.title;
        document.getElementById('newsCategory').value = news.category;
        document.getElementById('newsContent').value = news.content;
        document.getElementById('newsUrl').value = news.url || '';
        document.getElementById('newsTags').value = news.tags ? news.tags.join(', ') : '';
        document.getElementById('newsStatus').value = news.status;

        // 显示图片预览
        if (news.image) {
            document.getElementById('imagePreview').innerHTML = `<img src="${news.image}" alt="预览">`;
        }

        document.getElementById('newsModal').classList.add('show');
    }

    // 查看新闻
    viewNews(id) {
        const news = this.newsData.find(n => n.id === id);
        if (!news) return;

        // 可以打开新窗口显示新闻详情，或者跳转到前端页面
        window.open(`news.html#${id}`, '_blank');
    }

    // 删除新闻
    deleteNews(id) {
        this.currentDeleteId = id;
        document.getElementById('confirmModal').classList.add('show');
    }

    // 确认删除
    confirmDelete() {
        if (this.currentDeleteId) {
            this.newsData = this.newsData.filter(news => news.id !== this.currentDeleteId);
            this.saveNewsData();
            this.filterNews();
            this.updateStats();
            this.currentDeleteId = null;
        }
        this.closeConfirmModal();
    }

    // 批量删除
    batchDelete() {
        const selectedIds = Array.from(document.querySelectorAll('.news-checkbox:checked'))
            .map(cb => parseInt(cb.dataset.id));
        
        if (selectedIds.length === 0) {
            alert('请选择要删除的项目');
            return;
        }

        if (confirm(`确定要删除选中的 ${selectedIds.length} 条快讯吗？`)) {
            this.newsData = this.newsData.filter(news => !selectedIds.includes(news.id));
            this.saveNewsData();
            this.filterNews();
            this.updateStats();
            document.getElementById('selectAll').checked = false;
        }
    }

    // 保存新闻
    saveNews() {
        const form = document.getElementById('newsForm');
        const formData = new FormData(form);
        
        // 验证必填字段
        const title = document.getElementById('newsTitle').value.trim();
        const category = document.getElementById('newsCategory').value;
        const content = document.getElementById('newsContent').value.trim();

        if (!title || !category || !content) {
            alert('请填写所有必填字段');
            return;
        }

        // 处理标签
        const tagsInput = document.getElementById('newsTags').value.trim();
        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        // 处理图片
        const imageFile = document.getElementById('newsImage').files[0];
        let imageUrl = '';
        if (imageFile) {
            // 在实际应用中，这里应该上传到服务器
            // 这里使用本地URL作为示例
            imageUrl = URL.createObjectURL(imageFile);
        }

        const newsData = {
            id: this.currentEditId || Date.now(),
            title: title,
            category: category,
            content: content,
            url: document.getElementById('newsUrl').value.trim(),
            tags: tags,
            status: document.getElementById('newsStatus').value,
            publishTime: this.currentEditId ? 
                this.newsData.find(n => n.id === this.currentEditId).publishTime : 
                new Date().toISOString(),
            views: this.currentEditId ? 
                this.newsData.find(n => n.id === this.currentEditId).views || 0 : 0,
            likes: this.currentEditId ? 
                this.newsData.find(n => n.id === this.currentEditId).likes || 0 : 0,
            image: imageUrl || (this.currentEditId ? 
                this.newsData.find(n => n.id === this.currentEditId).image : '')
        };

        if (this.currentEditId) {
            // 更新现有新闻
            const index = this.newsData.findIndex(n => n.id === this.currentEditId);
            this.newsData[index] = newsData;
        } else {
            // 添加新新闻
            this.newsData.unshift(newsData);
        }

        this.saveNewsData();
        this.filterNews();
        this.updateStats();
        this.closeNewsModal();

        alert(this.currentEditId ? '快讯更新成功！' : '快讯添加成功！');
    }

    // 图片预览
    previewImage(file) {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('imagePreview').innerHTML = 
                    `<img src="${e.target.result}" alt="预览">`;
            };
            reader.readAsDataURL(file);
        }
    }

    // 导出新闻数据
    exportNews() {
        const dataStr = JSON.stringify(this.newsData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `ai-news-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // 关闭模态框
    closeNewsModal() {
        document.getElementById('newsModal').classList.remove('show');
    }

    closeConfirmModal() {
        document.getElementById('confirmModal').classList.remove('show');
    }

    // 登出
    logout() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = 'login.html';
    }
}

// 全局函数
function showAddNewsModal() {
    adminPanel.showAddNewsModal();
}

function closeNewsModal() {
    adminPanel.closeNewsModal();
}

function closeConfirmModal() {
    adminPanel.closeConfirmModal();
}

function saveNews() {
    adminPanel.saveNews();
}

function confirmDelete() {
    adminPanel.confirmDelete();
}

function exportNews() {
    adminPanel.exportNews();
}

function batchDelete() {
    adminPanel.batchDelete();
}

function logout() {
    adminPanel.logout();
}

// 初始化管理面板
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
}); 