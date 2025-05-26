// 移动端导航菜单切换
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 工具卡片点击统计
    document.querySelectorAll('.tool-card-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const toolName = this.querySelector('h3').textContent;
            const toolUrl = this.href;
            
            // 统计点击
            console.log(`用户点击了工具: ${toolName}, 链接: ${toolUrl}`);
            
            // 这里可以添加统计代码，比如发送到Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'tool_click', {
                    'tool_name': toolName,
                    'tool_url': toolUrl,
                    'event_category': 'engagement'
                });
            }
            
            // 添加点击动画效果
            const toolCard = this.querySelector('.tool-card');
            toolCard.style.transform = 'scale(0.98)';
            setTimeout(() => {
                toolCard.style.transform = '';
            }, 150);
        });
    });

    // 搜索功能
    const searchButtons = document.querySelectorAll('.search-btn');
    searchButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const searchEngine = this.textContent;
            console.log(`使用 ${searchEngine} 搜索`);
            
            // 这里可以添加实际的搜索逻辑
            // 例如打开对应的搜索引擎
            switch(searchEngine) {
                case 'Google':
                    window.open('https://www.google.com', '_blank');
                    break;
                case '百度':
                    window.open('https://www.baidu.com', '_blank');
                    break;
                case 'GitHub':
                    window.open('https://github.com', '_blank');
                    break;
                case 'Bing':
                    window.open('https://www.bing.com', '_blank');
                    break;
                case '站内':
                    // 实现站内搜索
                    showSearchModal();
                    break;
                // 添加更多搜索引擎
            }
        });
    });

    // 新闻项点击效果
    document.querySelectorAll('.news-item').forEach(item => {
        item.addEventListener('click', function() {
            const newsTitle = this.querySelector('h3').textContent;
            console.log(`点击了新闻: ${newsTitle}`);
            
            // 这里可以添加跳转到新闻详情页的逻辑
        });
    });

    // 懒加载图片（如果有的话）
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // 返回顶部按钮
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '↑';
    backToTop.className = 'back-to-top';
    backToTop.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #2563eb;
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        display: none;
        z-index: 1000;
        transition: all 0.3s;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    `;
    
    document.body.appendChild(backToTop);

    // 监听滚动事件
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.style.display = 'block';
        } else {
            backToTop.style.display = 'none';
        }
    });

    // 返回顶部功能
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 添加页面加载动画
    const toolCards = document.querySelectorAll('.tool-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    });

    toolCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s, transform 0.6s';
        observer.observe(card);
    });

    // 主题切换功能（可选）
    const themeToggle = document.createElement('button');
    themeToggle.innerHTML = '🌙';
    themeToggle.className = 'theme-toggle';
    themeToggle.style.cssText = `
        position: fixed;
        top: 50%;
        right: 20px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #fff;
        border: 2px solid #e5e7eb;
        font-size: 16px;
        cursor: pointer;
        z-index: 1000;
        transition: all 0.3s;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    
    document.body.appendChild(themeToggle);

    let isDarkMode = false;
    themeToggle.addEventListener('click', function() {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode', isDarkMode);
        this.innerHTML = isDarkMode ? '☀️' : '🌙';
    });

    // 工具链接状态检查
    checkToolLinks();
});

// 站内搜索模态框
function showSearchModal() {
    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.innerHTML = `
        <div class="search-modal-content">
            <div class="search-modal-header">
                <h3>站内搜索</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="search-modal-body">
                <input type="text" id="searchInput" placeholder="搜索AI工具..." autofocus>
                <div id="searchResults"></div>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    `;
    
    const content = modal.querySelector('.search-modal-content');
    content.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    document.body.appendChild(modal);
    
    // 关闭模态框
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // 搜索功能
    const searchInput = modal.querySelector('#searchInput');
    const searchResults = modal.querySelector('#searchResults');
    
    searchInput.addEventListener('input', debounce(function() {
        const query = this.value.toLowerCase();
        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }
        
        const tools = getAllTools();
        const results = tools.filter(tool => 
            tool.name.toLowerCase().includes(query) || 
            tool.description.toLowerCase().includes(query)
        );
        
        displaySearchResults(results, searchResults);
    }, 300));
}

// 获取所有工具数据
function getAllTools() {
    const tools = [];
    document.querySelectorAll('.tool-card-link').forEach(link => {
        const name = link.querySelector('h3').textContent;
        const description = link.querySelector('p').textContent;
        const url = link.href;
        tools.push({ name, description, url });
    });
    return tools;
}

// 显示搜索结果
function displaySearchResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">未找到相关工具</p>';
        return;
    }
    
    container.innerHTML = results.map(tool => `
        <div class="search-result-item" style="
            padding: 15px;
            border-bottom: 1px solid #e5e7eb;
            cursor: pointer;
            transition: background 0.3s;
        " onclick="window.open('${tool.url}', '_blank')">
            <h4 style="color: #2563eb; margin-bottom: 5px;">${tool.name}</h4>
            <p style="color: #666; font-size: 14px;">${tool.description}</p>
        </div>
    `).join('');
    
    // 添加悬停效果
    container.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.background = '#f8fafc';
        });
        item.addEventListener('mouseleave', function() {
            this.style.background = '';
        });
    });
}

// 检查工具链接状态
async function checkToolLinks() {
    const links = document.querySelectorAll('.tool-card-link[target="_blank"]');
    
    links.forEach(async (link) => {
        try {
            // 这里可以添加链接状态检查逻辑
            // 由于CORS限制，实际项目中可能需要后端API支持
            
            // 添加链接状态指示器
            const statusIndicator = document.createElement('div');
            statusIndicator.className = 'link-status';
            statusIndicator.style.cssText = `
                position: absolute;
                top: 10px;
                left: 10px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #10b981;
                opacity: 0.8;
            `;
            
            link.querySelector('.tool-card').appendChild(statusIndicator);
        } catch (error) {
            console.log('链接检查失败:', error);
        }
    });
}

// 工具数据管理（更新为包含链接）
const toolsData = {
    writing: [
        { name: '讯飞绘文', desc: '免费AI写作工具，5分钟生成一篇原创稿！', icon: '✍️', url: 'https://huiwen.iflyrec.com' },
        { name: '笔灵AI写作', desc: '面向专业写作领域的AI写作工具', icon: '📝', url: 'https://ibiling.cn' },
        { name: '火山写作', desc: '字节推出的免费AI写作助手', icon: '🔥', url: 'https://www.doubao.com' },
        { name: '新华妙笔', desc: '新华社推出的体制内办公学习平台', icon: '📰', url: 'https://miaobi.xinhua.org' }
    ],
    image: [
        { name: '堆友AI', desc: '阿里出品的免费AI绘画和出图神器', icon: '🎨', url: 'https://d.design' },
        { name: '美图设计室', desc: 'AI图像创作和设计平台', icon: '📸', url: 'https://design.meitu.com' },
        { name: '稿定AI设计', desc: '一站式AI设计与灵感创作平台', icon: '🖼️', url: 'https://www.gaoding.com' },
        { name: '绘蛙', desc: 'AI电商营销工具，免费生成商品图和种草文案', icon: '🐸', url: 'https://www.huiwa.com' }
    ]
};

// 动态加载更多工具（更新为包含链接）
function loadMoreTools(category) {
    const container = document.querySelector(`#${category} .tools-grid`);
    if (container && toolsData[category]) {
        toolsData[category].forEach(tool => {
            const toolCard = createToolCard(tool);
            container.appendChild(toolCard);
        });
    }
}

// 创建工具卡片（更新为包含链接）
function createToolCard(tool) {
    const link = document.createElement('a');
    link.href = tool.url;
    link.target = '_blank';
    link.className = 'tool-card-link';
    
    link.innerHTML = `
        <div class="tool-card">
            <div class="tool-icon">${tool.icon}</div>
            <div class="tool-info">
                <h3>${tool.name}</h3>
                <p>${tool.desc}</p>
            </div>
            <div class="external-link-icon">🔗</div>
        </div>
    `;
    
    // 添加点击统计
    link.addEventListener('click', function() {
        console.log(`点击了工具: ${tool.name}, URL: ${tool.url}`);
    });
    
    return link;
}

// 搜索功能
function searchTools(query) {
    const allToolLinks = document.querySelectorAll('.tool-card-link');
    const searchQuery = query.toLowerCase();
    
    allToolLinks.forEach(link => {
        const toolName = link.querySelector('h3').textContent.toLowerCase();
        const toolDesc = link.querySelector('p').textContent.toLowerCase();
        
        if (toolName.includes(searchQuery) || toolDesc.includes(searchQuery)) {
            link.style.display = 'block';
        } else {
            link.style.display = 'none';
        }
    });
}

// 工具收藏功能
const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

function toggleFavorite(toolName, toolUrl) {
    const toolData = { name: toolName, url: toolUrl };
    const index = favorites.findIndex(fav => fav.name === toolName);
    
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(toolData);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteButtons();
}

function updateFavoriteButtons() {
    document.querySelectorAll('.tool-card-link').forEach(link => {
        const toolName = link.querySelector('h3').textContent;
        const toolUrl = link.href;
        const isFavorite = favorites.some(fav => fav.name === toolName);
        
        let favoriteBtn = link.querySelector('.favorite-btn');
        if (!favoriteBtn) {
            favoriteBtn = document.createElement('button');
            favoriteBtn.className = 'favorite-btn';
            favoriteBtn.style.cssText = `
                position: absolute;
                top: 10px;
                left: 10px;
                background: rgba(255,255,255,0.9);
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                font-size: 14px;
                cursor: pointer;
                z-index: 10;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            const toolCard = link.querySelector('.tool-card');
            toolCard.style.position = 'relative';
            toolCard.appendChild(favoriteBtn);
            
            favoriteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(toolName, toolUrl);
            });
        }
        
        favoriteBtn.innerHTML = isFavorite ? '❤️' : '🤍';
        favoriteBtn.title = isFavorite ? '取消收藏' : '添加收藏';
    });
}

// 页面性能优化
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

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// 错误处理
window.addEventListener('error', function(e) {
    console.error('页面错误:', e.error);
    // 这里可以添加错误上报逻辑
});

// 页面卸载时保存状态
window.addEventListener('beforeunload', function() {
    // 保存用户的浏览状态
    const scrollPosition = window.pageYOffset;
    localStorage.setItem('scrollPosition', scrollPosition);
});

// 页面加载时恢复状态
window.addEventListener('load', function() {
    const savedScrollPosition = localStorage.getItem('scrollPosition');
    if (savedScrollPosition) {
        window.scrollTo(0, parseInt(savedScrollPosition));
        localStorage.removeItem('scrollPosition');
    }
    
    // 初始化收藏按钮
    setTimeout(updateFavoriteButtons, 1000);
});

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K 打开搜索
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        showSearchModal();
    }
    
    // ESC 关闭模态框
    if (e.key === 'Escape') {
        const modal = document.querySelector('.search-modal');
        if (modal) {
            document.body.removeChild(modal);
        }
    }
});

// 工具使用统计
function trackToolUsage(toolName, toolUrl) {
    const usage = JSON.parse(localStorage.getItem('toolUsage') || '{}');
    if (!usage[toolName]) {
        usage[toolName] = { count: 0, lastUsed: null, url: toolUrl };
    }
    usage[toolName].count++;
    usage[toolName].lastUsed = new Date().toISOString();
    localStorage.setItem('toolUsage', JSON.stringify(usage));
}

// 获取推荐工具
function getRecommendedTools() {
    const usage = JSON.parse(localStorage.getItem('toolUsage') || '{}');
    const sortedTools = Object.entries(usage)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 5);
    
    return sortedTools.map(([name, data]) => ({
        name,
        count: data.count,
        url: data.url
    }));
} 