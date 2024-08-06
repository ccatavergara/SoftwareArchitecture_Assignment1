async function fetchSales() {
    try {
        const response = await fetch('/api/salesByYear');
        const sales = await response.json();
        const books = await fetchBooks(); // Fetch books once
        const bookMap = new Map();
        books.forEach(book => {
            bookMap.set(book.id, book.name);
        });

        const salesList = document.getElementById('sales-list');
        salesList.innerHTML = '';
        sales.forEach(sale => {
            const bookName = bookMap.get(sale.book_id) || 'Unknown';
            const listItem = document.createElement('tr');
            listItem.innerHTML = `
                <td>${bookName}</td>
                <td>${sale.year}</td>
                <td>${sale.sales}</td>
                <td><button onclick="editSale('${sale.id}')">Edit</button></td>
                <td><button onclick="deleteSale('${sale.id}')">Delete</button></td>
            `;
            salesList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching sales:', error);
    }
}

async function fetchBooks() {
    try {
        const response = await fetch('/api/books');
        const books = await response.json();
        return books;
    } catch (error) {
        console.error('Error fetching books:', error);
    }
}

function showAddSaleForm() {
    document.getElementById('add-sale-form').style.display = 'block';
    populateBookDropdown('book_id');
}

function showEditSaleForm(sale) {
    document.getElementById('edit-sale-form').style.display = 'block';
    document.getElementById('edit-sale-id').value = sale.id;
    document.getElementById('edit-year').value = sale.year;
    document.getElementById('edit-sales').value = sale.sales;
    populateBookDropdown('edit-book_id', sale.book_id);
}

async function populateBookDropdown(elementId, selectedBookId = null) {
    const books = await fetchBooks();
    const bookSelect = document.getElementById(elementId);
    bookSelect.innerHTML = ''; // Clear existing options
    books.forEach(book => {
        const option = document.createElement('option');
        option.value = book.id;
        option.text = book.name;
        if (selectedBookId && book.id === selectedBookId) {
            option.selected = true;
        }
        bookSelect.appendChild(option);
    });
}

async function editSale(saleId) {
    try {
        const response = await fetch(`/api/salesByYear/${saleId}`);
        const sale = await response.json();
        showEditSaleForm(sale);
    } catch (error) {
        console.error('Error fetching sale for edit:', error);
    }
}

async function deleteSale(saleId) {
    try {
        const response = await fetch(`/api/salesByYear/${saleId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            alert('Sale deleted successfully!');
            window.location.reload();
        } else {
            const error = await response.json();
            alert('Error deleting sale: ' + error.error);
        }
    } catch (error) {
        console.error('Error deleting sale:', error);
        alert('Error deleting sale');
    }
}

document.getElementById('sale-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api/salesByYear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Sale added successfully!');
            window.location.reload();
        } else {
            const error = await response.json();
            alert('Error adding sale: ' + error.error);
        }
    } catch (error) {
        console.error('Error adding sale:', error);
        alert('Error adding sale');
    }
});

document.getElementById('edit-sale-form-content').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`/api/salesByYear/${data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Sale updated successfully!');
            window.location.reload();
        } else {
            const error = await response.json();
            alert('Error updating sale: ' + error.error);
        }
    } catch (error) {
        console.error('Error updating sale:', error);
        alert('Error updating sale');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    fetchSales();
});
