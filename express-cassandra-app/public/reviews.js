async function fetchReviews() {
    try {
        const response = await fetch('/api/reviews');
        const reviews = await response.json();
        const reviewsList = document.getElementById('reviews-list');
        reviewsList.innerHTML = '';
        reviews.forEach(review => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                Book ID: ${review.book} - Review: ${review.review} - Score: ${review.score} - Upvotes: ${review.number_of_upvotes}
            `;
            reviewsList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
}

async function fetchBooks() {
    try {
        const response = await fetch('/api/books');
        const books = await response.json();
        const bookSelect = document.getElementById('book');
        books.forEach(book => {
            const option = document.createElement('option');
            option.value = book.id;
            option.text = book.name;
            bookSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching books:', error);
    }
}

function showAddReviewForm() {
    document.getElementById('add-review-form').style.display = 'block';
}

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
        window.location.reload();
    } else {
        alert('Error adding review');
    }
});

fetchReviews();
fetchBooks();
