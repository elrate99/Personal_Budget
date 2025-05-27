const convertName = document.getElementById('name');
const convertDescription = document.getElementById('description');
const submitBtn = document.getElementById('submit-btn');
const container = document.querySelector('.convert-container');

submitBtn.addEventListener('click', () => {
    fetch(`/api/envelopes?header=${convertName.value}&convert=${convertDescription.value}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(() => {
        const queryResult = document.createElement('p');
        queryResult.innerHTML = 'Good! Your convert was added! Redirecting...';
        container.appendChild(queryResult);
        setTimeout(() => {
            window.location.href = 'index.html';
          }, 3000);
    })
})