
// Fetch books for dropdown
async function fetchBooks() {
    try {
        const response = await fetch('/api/books');
        if (!response.ok) throw new Error('Network response was not ok');
        const books = await response.json();
        const bookSelects = document.querySelectorAll('select[name="book"], select[name="edit-book"]');
        bookSelects.forEach(select => {
            select.innerHTML = books.map(book => `<option value="${book.id}">${book.name}</option>`).join('');
        });
    } catch (error) {
        console.error('Error fetching books:', error);
    }
}

// Fetch reviews and display them
async function fetchReviews() {
    try {
        console.log("entre a la funcion")
        const response = await fetch('/api/reviews');
        if (!response.ok) throw new Error('Network response was not ok');
        const reviews = await response.json();
        const reviewsList = document.getElementById('reviews-list');
        console.log(reviews);
        reviewsList.innerHTML = reviews.map(review => `
            <li>
                ${review.book}: ${review.review} (Score: ${review.score})
                <button onclick="editReview('${review.id}')">Edit</button>
                <button onclick="deleteReview('${review.id}')">Delete</button>
            </li>
        `).join('');
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
}

// Show the add review form
function showAddReviewForm() {
    document.getElementById('add-review-form').style.display = 'block';
}

// Show the edit review form
function showEditReviewForm(review) {
    document.getElementById('edit-review-form').style.display = 'block';
    document.getElementById('edit-review-id').value = review.id;
    document.getElementById('edit-review').value = review.review;
    document.getElementById('edit-score').value = review.score;
    const bookSelect = document.getElementById('edit-book');
    bookSelect.value = review.book;
}

// Edit review
async function editReview(reviewId) {
    try {
        const response = await fetch(`/api/reviews/${reviewId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const review = await response.json();
        showEditReviewForm(review);
    } catch (error) {
        console.error('Error fetching review for edit:', error);
        alert('Error fetching review for edit');
    }
}

// Delete review
async function deleteReview(reviewId) {
    try {
        const response = await fetch(`/api/reviews/${reviewId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            alert('Review deleted successfully!');
            fetchReviews();
        } else {
            const error = await response.json();
            alert('Error deleting review: ' + error.error);
        }
    } catch (error) {
        console.error('Error deleting review:', error);
        alert('Error deleting review');
    }
}

// Handle form submission for adding a review
document.getElementById('review-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        alert('Review added successfully!');
        document.getElementById('add-review-form').style.display = 'none'; // Hide form after submission
        fetchReviews();
    } else {
        alert('Error adding review');
    }
});

// Handle form submission for editing a review
document.getElementById('edit-review-form-content').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch(`/api/reviews/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        alert('Review updated successfully!');
        document.getElementById('edit-review-form').style.display = 'none'; // Hide form after submission
        fetchReviews();
    } else {
        alert('Error updating review');
    }
});

fetchBooks();
fetchReviews();