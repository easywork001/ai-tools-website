// 快讯页面JavaScript功能
document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    const itemsPerPage = 10;
    let allNews = [];
    let filteredNews = [];

    // 初始化页面
    initializePage();

    // 绑定事件
    bindEvents();

    // 初始化页面
    function initializePage() {
        loadNews();
        updateStats();
        generateTagsCloud();
        updateMonthStats();
    }

    // 绑定事件
    function bindEvents() {
        // 筛选事件
        document.getElementById('categoryFilter').addEventListener('change', filterNews);
        document.getElementById('timeFilter').addEventListener('change', filterNews);
        document.getElementById('newsSearch').addEventListener('input', debounce(filterNews, 300));
        document.getElementById('searchBtn').addEventListener('click', filterNews);

        // 加载更多
        document.getElementById('loadMoreBtn').addEventListener('click', loadMoreNews);

        // 订阅表单
        document.getElementById('subscribeForm').addEventListener('submit', handleSubscribe);

        // 监听localStorage变化（管理员更新快讯时）
        window.addEventListener('storage', function(e) {
            if (e.key === 'publicNews') {
                loadNews();
            }
        });
    }

    // 加载快讯数据
    function loadNews() {
        // 从localStorage获取公开快讯数据
        const publicNews = JSON.parse(localStorage.getItem('publicNews') || '[]');
        
        // 如果没有公开快讯，使用示例数据
        if (publicNews.length === 0) {
            allNews = getSampleNews();
        } else {
            allNews = publicNews;
        }

        // 按时间排序
        allNews.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime));
        
        filteredNews = [...allNews];
        currentPage = 1;
        
        renderNews();
        updateStats();
    }

    // 获取示例快讯数据
    function getSampleNews() {
        return [
            {
                id: 1,
                title: 'OpenAI 发布 GPT-5 模型，性能大幅提升',
                content: 'OpenAI 今日正式发布了 GPT-5 模型，在推理能力、代码生成和多模态理解方面都有显著提升。新模型支持更长的上下文窗口，能够处理更复杂的任务。据官方测试，GPT-5 在多项基准测试中的表现超越了前代模型，特别是在数学推理和代码生成方面有了质的飞跃。',
                category: '产品发布',
                source: 'OpenAI',
                url: 'https://openai.com',
                tags: ['GPT-5', 'OpenAI', '大模型', '人工智能'],
                publishTime: new Date().toISOString(),
                views: 1250
            },
            {
                id: 2,
                title: '谷歌推出 Gemini Ultra 2.0，挑战 GPT-5',
                content: '谷歌发布了最新的 Gemini Ultra 2.0 模型，声称在多项测试中超越了竞争对手。新模型在多模态理解、科学推理和创意写作方面表现出色，支持更长的上下文长度和更快的推理速度。',
                category: '产品发布',
                source: '谷歌',
                url: 'https://google.com',
                tags: ['Gemini', '谷歌', '多模态', 'AI模型'],
                publishTime: new Date(Date.now() - 86400000).toISOString(),
                views: 980
            },
            {
                id: 3,
                title: 'Anthropic 获得 50 亿美元融资，估值达 400 亿美元',
                content: 'AI 安全公司 Anthropic 完成了新一轮 50 亿美元的融资，投后估值达到 400 亿美元。本轮融资由知名投资机构领投，资金将用于扩大 Claude 模型的研发和安全性研究。',
                category: '融资动态',
                source: 'TechCrunch',
                url: 'https://techcrunch.com',
                tags: ['Anthropic', '融资', 'Claude', 'AI安全'],
                publishTime: new Date(Date.now() - 172800000).toISOString(),
                views: 756
            },
            {
                id: 4,
                title: '中国发布 AI 治理新规，加强大模型监管',
                content: '国家网信办发布了《人工智能大模型服务管理办法》，对大模型的训练、部署和服务提供了详细的监管要求。新规要求大模型服务商必须进行安全评估和备案。',
                category: '政策法规',
                source: '国家网信办',
                url: 'https://cac.gov.cn',
                tags: ['政策法规', '大模型', '监管', '中国'],
                publishTime: new Date(Date.now() - 259200000).toISOString(),
                views: 642
            },
            {
                id: 5,
                title: 'Meta 开源 Llama 3.5，性能媲美闭源模型',
                content: 'Meta 发布了开源大模型 Llama 3.5，在多项基准测试中的表现接近甚至超越了一些闭源商业模型。这一举措进一步推动了开源 AI 生态的发展。',
                category: '技术突破',
                source: 'Meta',
                url: 'https://meta.com',
                tags: ['Meta', 'Llama', '开源', '大模型'],
                publishTime: new Date(Date.now() - 345600000).toISOString(),
                views: 523
            }
        ];
    }

    // 渲染快讯列表
    function renderNews() {
        const newsList = document.getElementById('newsList');
        const startIndex = 0;
        const endIndex = currentPage * itemsPerPage;
        const newsToShow = filteredNews.slice(startIndex, endIndex);

        if (newsToShow.length === 0) {
            newsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📰</div>
                    <h3>暂无快讯</h3>
                    <p>没有找到符合条件的快讯，请尝试调整筛选条件</p>
                </div>
            `;
            document.getElementById('loadMoreBtn').style.display = 'none';
            return;
        }

        newsList.innerHTML = newsToShow.map(news => createNewsHTML(news)).join('');

        // 更新加载更多按钮状态
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (endIndex >= filteredNews.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }

        // 绑定事件
        bindNewsEvents();
    }

    // 创建快讯HTML
    function createNewsHTML(news) {
        const publishTime = formatTime(news.publishTime);
        const tags = news.tags ? news.tags.map(tag => 
            `<span class="news-tag" onclick="filterByTag('${tag}')">${tag}</span>`
        ).join('') : '';

        return `
            <article class="news-item" data-id="${news.id}">
                <div class="news-item-header">
                    <h2 class="news-item-title">${news.title}</h2>
                </div>
                
                <div class="news-item-meta">
                    <span class="news-category ${news.category}">${news.category}</span>
                    <span>来源：${news.source || '未知'}</span>
                    <span>发布时间：${publishTime}</span>
                    <span>浏览量：${news.views || 0}</span>
                </div>
                
                <div class="news-item-content">${news.content}</div>
                
                <div class="news-item-footer">
                    <div class="news-tags">${tags}</div>
                    <div class="news-actions">
                        ${news.url ? `<a href="${news.url}" target="_blank" class="news-link">查看原文 →</a>` : ''}
                        <button class="share-btn" onclick="shareNews(${news.id})" title="分享">📤</button>
                    </div>
                </div>
            </article>
        `;
    }

    // 绑定快讯事件
    function bindNewsEvents() {
        // 点击快讯增加浏览量
        document.querySelectorAll('.news-item').forEach(item => {
            item.addEventListener('click', function(e) {
                if (!e.target.closest('.news-actions')) {
                    const newsId = parseInt(this.dataset.id);
                    incrementViews(newsId);
                }
            });
        });
    }

    // 筛选快讯
    function filterNews() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const timeFilter = document.getElementById('timeFilter').value;
        const searchTerm = document.getElementById('newsSearch').value.toLowerCase();

        filteredNews = allNews.filter(news => {
            // 分类筛选
            if (categoryFilter !== 'all' && news.category !== categoryFilter) {
                return false;
            }

            // 时间筛选
            if (timeFilter !== 'all') {
                const newsDate = new Date(news.publishTime);
                const now = new Date();
                
                switch (timeFilter) {
                    case 'today':
                        if (newsDate.toDateString() !== now.toDateString()) return false;
                        break;
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        if (newsDate < weekAgo) return false;
                        break;
                    case 'month':
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        if (newsDate < monthAgo) return false;
                        break;
                }
            }

            // 搜索筛选
            if (searchTerm) {
                const searchableText = `${news.title} ${news.content} ${news.source}`.toLowerCase();
                if (!searchableText.includes(searchTerm)) return false;
            }

            return true;
        });

        currentPage = 1;
        renderNews();
    }

    // 按标签筛选
    function filterByTag(tag) {
        document.getElementById('newsSearch').value = tag;
        filterNews();
        
        // 高亮选中的标签
        document.querySelectorAll('.tag-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tag="${tag}"]`)?.classList.add('active');
    }

    // 加载更多快讯
    function loadMoreNews() {
        currentPage++;
        renderNews();
    }

    // 更新统计数据
    function updateStats() {
        const newsCount = allNews.length;
        const lastUpdate = allNews.length > 0 ? 
            formatTime(allNews[0].publishTime) : '--';

        document.getElementById('newsCount').textContent = newsCount;
        document.getElementById('updateTime').textContent = lastUpdate;
    }

    // 生成标签云
    function generateTagsCloud() {
        const tagCounts = {};
        
        allNews.forEach(news => {
            if (news.tags) {
                news.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        const sortedTags = Object.entries(tagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 20);

        const tagsCloud = document.getElementById('tagsCloud');
        tagsCloud.innerHTML = sortedTags.map(([tag, count]) => 
            `<span class="tag-item" data-tag="${tag}" onclick="filterByTag('${tag}')">${tag} (${count})</span>`
        ).join('');
    }

    // 更新月度统计
    function updateMonthStats() {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const monthNews = allNews.filter(news => 
            new Date(news.publishTime) >= monthStart
        );

        const stats = {
            '产品发布': 0,
            '技术突破': 0,
            '融资动态': 0,
            '行业动态': 0
        };

        monthNews.forEach(news => {
            if (stats.hasOwnProperty(news.category)) {
                stats[news.category]++;
            }
        });

        document.getElementById('productCount').textContent = stats['产品发布'];
        document.getElementById('techCount').textContent = stats['技术突破'];
        document.getElementById('fundingCount').textContent = stats['融资动态'];
        document.getElementById('industryCount').textContent = stats['行业动态'];
    }

    // 处理订阅
    function handleSubscribe(e) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        
        // 这里应该调用实际的订阅API
        showNotification('订阅成功！我们会将最新AI快讯发送到您的邮箱。', 'success');
        e.target.reset();
    }

    // 增加浏览量
    function incrementViews(newsId) {
        // 这里应该调用API更新浏览量
        const newsIndex = allNews.findIndex(news => news.id === newsId);
        if (newsIndex !== -1) {
            allNews[newsIndex].views = (allNews[newsIndex].views || 0) + 1;
            // 更新显示
            const viewsElement = document.querySelector(`[data-id="${newsId}"] .news-item-meta span:last-child`);
            if (viewsElement) {
                viewsElement.textContent = `浏览量：${allNews[newsIndex].views}`;
            }
        }
    }

    // 分享快讯
    window.shareNews = function(newsId) {
        const news = allNews.find(item => item.id === newsId);
        if (!news) return;

        if (navigator.share) {
            navigator.share({
                title: news.title,
                text: news.content.substring(0, 100) + '...',
                url: window.location.href
            });
        } else {
            // 复制链接到剪贴板
            const url = `${window.location.origin}${window.location.pathname}#news-${newsId}`;
            navigator.clipboard.writeText(url).then(() => {
                showNotification('链接已复制到剪贴板', 'success');
            });
        }
    };

    // 格式化时间
    function formatTime(timeString) {
        const date = new Date(timeString);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) {
            return `${minutes}分钟前`;
        } else if (hours < 24) {
            return `${hours}小时前`;
        } else if (days < 7) {
            return `${days}天前`;
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    }

    // 显示通知
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 3000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // 防抖函数
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

    // 全局函数
    window.filterByTag = filterByTag;
});

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style); 