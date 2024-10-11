document.addEventListener("click", documentActions);

function documentActions(e) {
	const targetElement = e.target;

	if (targetElement.closest('.icon-menu')) {
		document.body.classList.toggle('menu-open');
	}
    if (targetElement.closest('.menu__link')) {
        document.body.classList.remove('menu-open');
    }
}

// ------------------------------------------------------------------------------

const rowsPerPage = 8; // Встановлюємо кількість записів на сторінці
let currentPage = 1;
let originalData = []; // Зберігаємо оригінальні дані
let filteredData = []; // Фільтровані дані для пошуку
let searchTerm = ''; // Зберігаємо пошуковий термін глобально

// Функція для створення рядка таблиці
function createRow(customer) {
    const row = document.createElement('tr');
    const cells = ['name', 'company', 'phone', 'email', 'country', 'status'];
    cells.forEach(cell => {
        const td = document.createElement('td');
        const span = document.createElement('span');

        // Підсвічування збігів
        const highlightedText = highlightMatches(customer[cell], searchTerm);
        span.innerHTML = highlightedText;

        td.appendChild(span);
        row.appendChild(td);

        if (cell === 'status') {
            // Додаємо клас для статусу
            if (customer[cell] === 'Active') {
                span.classList.add('status', 'active');
            } else if (customer[cell] === 'Inactive') {
                span.classList.add('status', 'inactive');
            }

            // Додаємо подію на клік для зміни статусу
            span.addEventListener('click', () => {
                if (customer[cell] === 'Active') {
                    customer[cell] = 'Inactive'; // Змінюємо статус в даних
                    span.textContent = 'Inactive'; // Змінюємо текст
                    span.classList.remove('active');
                    span.classList.add('inactive');
                } else {
                    customer[cell] = 'Active'; // Змінюємо статус в даних
                    span.textContent = 'Active'; // Змінюємо текст
                    span.classList.remove('inactive');
                    span.classList.add('active');
                }
            });
        }
    });
    return row;
}

// Функція для підсвічування збігів
function highlightMatches(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Функція для відображення сторінки з даними
function displayPage(page, searchTerm = '') {
    const tableBody = document.querySelector('.table__body');
    tableBody.innerHTML = ''; // Очищаємо попередні рядки

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredData.slice(start, end); // Відображаємо потрібні записи

    pageData.forEach(customer => {
        const row = createRow(customer); // Передаємо пошуковий термін для підсвічування
        tableBody.appendChild(row);
    });

    // Оновлюємо текст показу кількості записів
    const infoText = document.querySelector('.content__info');
    const totalEntries = filteredData.length;
    const startEntry = start + 1;
    const endEntry = Math.min(end, totalEntries);
    infoText.textContent = `Showing data ${startEntry} to ${endEntry} of ${totalEntries} entries`;

    updatePagination(); // Оновлюємо пагінацію
}

// Функція для обробки пошуку та підсвічування
function handleSearch(event) {
    searchTerm = event.target.value.toLowerCase(); // Оновлюємо глобальний пошуковий термін
    currentPage = 1; // Починаємо з першої сторінки при пошуку

    // Фільтруємо дані
    filteredData = originalData.filter(customer =>
        Object.values(customer).some(value =>
            value.toLowerCase().includes(searchTerm)
        )
    );

    displayPage(currentPage, searchTerm); // Відображаємо фільтровані дані з підсвічуванням
}

// Функція для оновлення пагінації з еліпсисом
function updatePagination() {
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = ''; // Очищаємо попередню пагінацію

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    // Кнопка попередньої сторінки
    const prevButton = document.createElement('button');
    prevButton.classList.add('pagination__button');
    prevButton.textContent = '<';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayPage(currentPage, searchTerm); // Передаємо пошуковий термін при перемиканні сторінок
        }
    });
    pagination.appendChild(prevButton);

    // Додаємо сторінки з еліпсисом
    const maxVisiblePages = 3; // Максимум видимих сторінок
    let startPage = Math.max(currentPage - 2, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    // Показуємо першу сторінку, якщо вона не в діапазоні
    if (startPage > 1) {
        const firstPageButton = document.createElement('button');
        firstPageButton.classList.add('pagination__button');
        firstPageButton.textContent = '1';
        firstPageButton.addEventListener('click', () => {
            currentPage = 1;
            displayPage(currentPage, searchTerm); // Передаємо пошуковий термін при перемиканні сторінок
        });
        pagination.appendChild(firstPageButton);

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.classList.add('pagination__ellipsis');
            ellipsis.textContent = '...';
            pagination.appendChild(ellipsis);
        }
    }

    // Показуємо сторінки між startPage та endPage
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.classList.add('pagination__button');
        pageButton.textContent = i;
        if (i === currentPage) {
            pageButton.classList.add('pagination__button--active');
        }
        pageButton.addEventListener('click', () => {
            currentPage = i;
            displayPage(currentPage, searchTerm); // Передаємо пошуковий термін при перемиканні сторінок
        });
        pagination.appendChild(pageButton);
    }

    // Показуємо останню сторінку, якщо вона не в діапазоні
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.classList.add('pagination__ellipsis');
            ellipsis.textContent = '...';
            pagination.appendChild(ellipsis);
        }

        const lastPageButton = document.createElement('button');
        lastPageButton.classList.add('pagination__button');
        lastPageButton.textContent = totalPages;
        lastPageButton.addEventListener('click', () => {
            currentPage = totalPages;
            displayPage(currentPage, searchTerm); // Передаємо пошуковий термін при перемиканні сторінок
        });
        pagination.appendChild(lastPageButton);
    }

    // Кнопка наступної сторінки
    const nextButton = document.createElement('button');
    nextButton.classList.add('pagination__button');
    nextButton.textContent = '>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayPage(currentPage, searchTerm); // Передаємо пошуковий термін при перемиканні сторінок
        }
    });
    pagination.appendChild(nextButton);
}

// Завантажуємо дані з JSON файлу
fetch('customers.json')
    .then(response => response.json())
    .then(data => {
        originalData = data; // Зберігаємо оригінальні дані
        filteredData = data; // Фільтровані дані спочатку рівні оригінальним

        displayPage(1); // Відображаємо першу сторінку

        const searchInput = document.getElementById('search');
        searchInput.addEventListener('input', handleSearch); // Пошук із підсвічуванням
    });

// ------------------------------------------------------------------------------

