const fetchAllConverts = document.getElementById('fetch-converts');
const fetchById = document.getElementById('fetch-by-id');
const fetchByName = document.getElementById('fetch-by-name');
const container = document.querySelector('.convert-container');

const resetConverts = () => {
    container.innerHTML = '';
}

const renderError = response => {
    container.innerHTML = `<p>Your request returned an error from the server:</p>
    <p>Code: ${response.status}</p>
    <p>${response.statusText}</p>`
}

  const renderConverts = (converts = []) => {
    resetConverts();
    if (converts.length > 0) {
        converts.forEach(convert => {
            const newConvert = document.createElement('div');
            newConvert.className = 'convert';
            newConvert.innerHTML = `<h3 class="convert-header">${convert.header}</h3>
            <div class="convert-description">
                <p class="convert-text">ID: ${convert.id}</p>
                <p class="convert-text">Description: ${convert.convert}</p>
                <p class="convert-amount">Price: ${convert.amount} EUR</p>
                <div class="buttons">
                <button class="edit-btn">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="delete-btn" data-id="${convert.id}">
                    <i class="fas fa-times"></i>
                </button>
                </div>
            </div>`

            const header = newConvert.querySelector('.convert-header');
            const description = newConvert.querySelector('.convert-description');
            const editBtn = newConvert.querySelector('.edit-btn');
            const deleteBtn = newConvert.querySelector('.delete-btn');

            header.addEventListener('click', () => {
                description.classList.toggle('show');
            })

            deleteBtn.addEventListener('click', () => {
                const id = deleteBtn.getAttribute('data-id');
                fetch(`/api/envelopes/${id}`, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (response.ok) {
                        return response.json()
                    } else {
                        renderError(response);
                    }
                })
                .then(() => {
                    newConvert.remove();
                })
            })

            container.appendChild(newConvert);
        });
    } else {
        container.innerHTML = '<p>Your request returned no converts</p>';
    }
  }
  
  fetchAllConverts.addEventListener('click', () => {
    fetch('/api/envelopes')
    .then(response => {
        if(response.ok) {
            return response.json();
        } else {
            renderError(response);
        }
    })
    .then(response => {
        renderConverts(response)
    })
  });

  fetchById.addEventListener('click', () => {
    const id = document.getElementById('search').value;
    fetch(`/api/envelopes/id/${id}`)
    .then(response => {
        if(response.ok) {
            return response.json();
        } else {
            renderError(response);
        }
    })
    .then(response => {
        renderConverts(response);
    })
  })

  fetchByName.addEventListener('click', () => {
    const name = document.getElementById('search').value;
    fetch(`/api/envelopes/name/${name}`)
    .then(response => {
        if(response.ok) {
            return response.json();
        } else {
            renderError(response);
        }
    })
    .then(response => {
        renderConverts(response);
    })
  })

  