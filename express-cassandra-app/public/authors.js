async function fetchAuthors() {
    try {
        const response = await fetch('/api/authors');
        const authors = await response.json();
        const authorsList = document.getElementById('authors-list');
        authorsList.innerHTML = '';
        authors.forEach(author => {
            const listItem = document.createElement('tr');
            listItem.innerHTML = `
            <td>${author.name}</td>
            <td>${author.date_of_birth}</td>
            <td>${author.country_of_origin}</td>
            <td><button onclick="editAuthor('${author.id}')">Edit</button></td>
            <td><button onclick="deleteAuthor('${author.id}')">Delete</button></td>
            `;
            authorsList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching authors:', error);
    }
}

function showAddAuthorForm() {
    document.getElementById('add-author-form').style.display = 'block';
}

function showEditAuthorForm(author) {
    document.getElementById('edit-author-form').style.display = 'block';
    document.getElementById('edit-author-id').value = author.id;
    document.getElementById('edit-name').value = author.name;
    document.getElementById('edit-date_of_birth').value = author.date_of_birth;
    document.getElementById('edit-country_of_origin').value = author.country_of_origin;
    document.getElementById('edit-short_description').value = author.short_description;
}

async function editAuthor(authorId) {
    try {
        const response = await fetch(`/api/authors/${authorId}`);
        const author = await response.json();
        showEditAuthorForm(author);
    } catch (error) {
        console.error('Error fetching author for edit:', error);
    }
}

async function deleteAuthor(authorId) {
    try {
        const response = await fetch(`/api/authors/${authorId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            alert('Author deleted successfully!');
            window.location.reload();
        } else {
            const error = await response.json();
            alert('Error deleting author: ' + error.error);
        }
    } catch (error) {
        console.error('Error deleting author:', error);
        alert('Error deleting author');
    }
}

document.getElementById('author-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api/authors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Author added successfully!');
            window.location.reload();
        } else {
            const error = await response.json();
            alert('Error adding author: ' + error.error);
        }
    } catch (error) {
        console.error('Error adding author:', error);
        alert('Error adding author');
    }
});

document.getElementById('edit-author-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`/api/authors/${data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Author updated successfully!');
            window.location.reload();
        } else {
            const error = await response.json();
            alert('Error updating author: ' + error.error);
        }
    } catch (error) {
        console.error('Error updating author:', error);
        alert('Error updating author');
    }
});

fetchAuthors();