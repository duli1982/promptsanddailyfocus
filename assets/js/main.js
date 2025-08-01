// --- DATA STRUCTURE ---
let promptData = {};

async function loadPrompts() {
    try {
        const response = await fetch('./prompts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        promptData = data.promptData;
        renderHomepage(); // Initialize UI after data loads
    } catch (error) {
        console.error('Failed to load prompts:', error);
        // Display an error message to the user
        const categoryCardsContainer = document.getElementById('category-cards-container');
        categoryCardsContainer.innerHTML = `
            <div class="text-center text-red-500">
                <p>Error loading prompts. Please try again later.</p>
            </div>
        `;
    }
}

// --- DOM ELEMENTS ---
const homepageView = document.getElementById('homepage-view');
const detailView = document.getElementById('detail-view');
const categoryCardsContainer = document.getElementById('category-cards-container');
const searchInput = document.getElementById('search-input');
const searchResultsContainer = document.getElementById('search-results-container');
const promptDisplayArea = document.getElementById('prompt-display-area');
const quickLinksSidebar = document.getElementById('quick-links-sidebar');
const backToHomeBtn = document.getElementById('back-to-home-btn');
 const menuButton = document.getElementById('menu-button');
const mobileMenu = document.getElementById('mobile-menu');


// --- RENDER FUNCTIONS ---

/**
 * Renders the initial homepage view with category cards.
 */
function renderHomepage() {
    categoryCardsContainer.innerHTML = '';
    for (const categoryName in promptData) {
        const category = promptData[categoryName];
        const subCategories = Object.keys(category);

        const card = document.createElement('div');
        card.className = 'prompt-block flex flex-col';

        let subCategoryLinks = subCategories.map(subName =>
            `<li><a href="#" class="block py-1.5 text-gray-500" data-category="${categoryName}" data-subcategory="${subName}">→ ${subName}</a></li>`
        ).join('');

        card.innerHTML = `
            <div class="p-6">
                <h2 class="text-xl font-bold text-center main-heading">Gemini Prompts for <span class="accent-text">${categoryName}</span></h2>
            </div>
            <div class="flex-grow px-6 category-card-list scrollable-list overflow-y-auto">
                <ul>${subCategoryLinks}</ul>
            </div>
            <div class="p-6 mt-auto">
                <button class="see-all-btn w-full py-2.5 rounded-md font-semibold" data-category="${categoryName}">See all prompts →</button>
            </div>
        `;
        categoryCardsContainer.appendChild(card);
    }
}

/**
 * Renders the detail view for a specific sub-category.
 * @param {string} activeCategory - The main category to display.
 * @param {string} activeSubCategory - The sub-category to display.
 */
function renderDetailView(activeCategory, activeSubCategory) {
    // Render the main prompt content
    promptDisplayArea.innerHTML = '';
    const subCategoryPrompts = promptData[activeCategory][activeSubCategory];

    const header = document.createElement('h1');
    header.className = 'text-3xl font-bold mb-8 main-heading';
    header.innerHTML = `Gemini Prompts for <span class="accent-text">${activeSubCategory}</span>`;
    promptDisplayArea.appendChild(header);

    subCategoryPrompts.forEach(prompt => {
        const promptEl = document.createElement('div');
        promptEl.className = 'mb-8';
        promptEl.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <h3 class="text-xl font-semibold main-heading">${prompt.title}</h3>
                <button class="copy-btn flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                    <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    <span>Copy</span>
                </button>
            </div>
            <div class="prompt-display-item p-4 text-gray-700">
                <p>${prompt.content}</p>
            </div>
        `;
        promptDisplayArea.appendChild(promptEl);
    });

    // Render the quick links sidebar
    quickLinksSidebar.innerHTML = '';
    for (const categoryName in promptData) {
        const categoryTitle = document.createElement('h4');
        categoryTitle.className = 'font-bold mt-4 mb-2 main-heading';
        categoryTitle.innerHTML = `Gemini Prompts for <span class="accent-text">${categoryName}</span>`;
        quickLinksSidebar.appendChild(categoryTitle);

        const subList = document.createElement('ul');
        for (const subCategoryName in promptData[categoryName]) {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = subCategoryName;
            link.dataset.category = categoryName;
            link.dataset.subcategory = subCategoryName;
            // Highlight the active link
            if (categoryName === activeCategory && subCategoryName === activeSubCategory) {
                link.className = 'active font-semibold';
            }
            li.appendChild(link);
            subList.appendChild(li);
        }
        quickLinksSidebar.appendChild(subList);
    }
}

// --- NAVIGATION LOGIC ---

/**
 * Switches the view from homepage to detail page.
 * @param {string} category - The main category to show.
 * @param {string} subCategory - The specific sub-category to show.\
 */
function showDetailView(category, subCategory) {
    renderDetailView(category, subCategory);
    homepageView.classList.add('hidden');
    detailView.classList.remove('hidden');
    detailView.classList.add('fade-in');
    window.scrollTo(0, 0); // Scroll to top
}

/**
 * Switches the view from detail page back to the homepage.
 */
function showHomepage() {
    detailView.classList.add('hidden');
    homepageView.classList.remove('hidden');
    homepageView.classList.add('fade-in');
}

function renderSearchResults(results) {
    searchResultsContainer.innerHTML = ''; // Clear previous results

    if (results.length === 0) {
        searchResultsContainer.innerHTML = `<p class="text-center text-gray-500">No prompts found.</p>`;
        return;
    }

    const resultsGrid = document.createElement('div');
    resultsGrid.className = 'grid md:grid-cols-2 lg:grid-cols-3 gap-8';

    results.forEach(result => {
        const promptEl = document.createElement('div');
        promptEl.className = 'prompt-block flex flex-col p-6 cursor-pointer'; // Re-using prompt-block style

        const truncatedContent = result.prompt.content.length > 150 ? result.prompt.content.substring(0, 150) + '...' : result.prompt.content;

        promptEl.innerHTML = `
            <div>
                <h3 class="text-lg font-bold main-heading mb-2">${result.prompt.title}</h3>
                <p class="text-sm text-gray-500 mb-4"><em>${result.category} > ${result.subcategory}</em></p>
                <p class="text-gray-600 text-sm">${truncatedContent}</p>
            </div>
        `;

        promptEl.addEventListener('click', () => {
            showDetailView(result.category, result.subcategory);
        });

        resultsGrid.appendChild(promptEl);
    });
    searchResultsContainer.appendChild(resultsGrid);
}

/**
 * Handles the search input event.
 */
function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (searchTerm.length < 2) {
        searchResultsContainer.classList.add('hidden');
        categoryCardsContainer.classList.remove('hidden');
        searchResultsContainer.innerHTML = '';
        return;
    }

    const allPrompts = [];
    for (const categoryName in promptData) {
        for (const subCategoryName in promptData[categoryName]) {
            promptData[categoryName][subCategoryName].forEach(prompt => {
                allPrompts.push({
                    category: categoryName,
                    subcategory: subCategoryName,
                    prompt: prompt
                });
            });
        }
    }

    const filteredPrompts = allPrompts.filter(({ prompt }) => {
        return prompt.title.toLowerCase().includes(searchTerm) ||
               prompt.content.toLowerCase().includes(searchTerm);
    });

    categoryCardsContainer.classList.add('hidden');
    searchResultsContainer.classList.remove('hidden');
    renderSearchResults(filteredPrompts);
}
// --- EVENT LISTENERS ---

// Event listener for the homepage
categoryCardsContainer.addEventListener('click', (e) => {
    const target = e.target;

    // Handle "See all prompts" button click
    if (target.classList.contains('see-all-btn')) {
        const categoryName = target.dataset.category;
        // Show the first sub-category by default
        const firstSubCategory = Object.keys(promptData[categoryName])[0];
        showDetailView(categoryName, firstSubCategory);
    }

    // Handle clicking on a sub-category link
    if (target.tagName === 'A' && target.dataset.subcategory) {
        e.preventDefault();
        showDetailView(target.dataset.category, target.dataset.subcategory);
    }
});

// Event listener for the detail view's quick links
quickLinksSidebar.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.dataset.subcategory) {
        e.preventDefault();
        const category = e.target.dataset.category;
        const subCategory = e.target.dataset.subcategory;
        renderDetailView(category, subCategory); // Re-render the view
    }
});

// Event listener for the "Back" button
backToHomeBtn.addEventListener('click', showHomepage);

promptDisplayArea.addEventListener('click', (e) => {
    if (e.target.closest('.copy-btn')) {
        const button = e.target.closest('.copy-btn');
        const promptContent = button.closest('.mb-8').querySelector('.prompt-display-item p').textContent;

        navigator.clipboard.writeText(promptContent).then(() => {
            const originalText = button.innerHTML;
            button.innerHTML = `
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span>Copied!</span>`;
            button.disabled = true;
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy text.');
        });
    }
});

// Mobile menu toggle
menuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
     // Toggle aria-expanded attribute
    const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', !isExpanded);
    // Toggle the hamburger and close icons
    menuButton.querySelector('svg:nth-child(2)').classList.toggle('hidden');
    menuButton.querySelector('svg:nth-child(3)').classList.toggle('hidden');
});

searchInput.addEventListener('input', handleSearch);


// --- INITIAL LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    loadPrompts();
});
