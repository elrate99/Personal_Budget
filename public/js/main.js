const fetchAllConverts = document.getElementById('fetch-converts');
const fetchById = document.getElementById('fetch-by-id');
const fetchByName = document.getElementById('fetch-by-name');
const container = document.querySelector('.convert-container');
const openBtn = document.getElementById('openPopup');
const budgetText = document.querySelector('.budget-text');
import { createPopup } from "./utilspopup.js";

let isEditing = false;
const resetConverts = () => {
    container.innerHTML = '';
}

const renderError = response => {
    container.innerHTML = `<p>Your request returned an error from the server:</p>
    <p>Code: ${response.status}</p>
    <p>${response.statusText}</p>`
}

const BudgetInfo = () => {
    fetch('/api/envelopes/budget')
    .then(response => {
        if(response.ok) {
            return response.json();
        } else {
            renderError(response);
        }
    })
    .then(response => {
        console.log('Budget received:', response);
        renderBudget(response);
    })
}
BudgetInfo();

const renderBudget = (budget = {}) => {
    budgetText.innerHTML = `Total Budget: ${budget.budget} EUR`
}

const renderConverts = (converts = []) => {
    resetConverts();
    if (converts.length > 0) {
        converts.forEach(convert => {
            const newConvert = document.createElement('div');
            newConvert.className = 'convert';
            newConvert.innerHTML = `
                <h3 class="convert-header">${convert.header}</h3>
                <div class="convert-description">
                    <p class="convert-text">ID: ${convert.id}</p>
                    <p class="convert-text">Description: ${convert.convert}</p>
                    <p class="convert-amount">Price: ${convert.amount} EUR</p>
                    <div class="buttons">
                        <button class="deposit-btn" data-id="${convert.id}">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button class="withdraw-btn" data-id="${convert.id}">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                        <button class="transfer-btn" data-id="${convert.id}">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                        <button class="edit-btn" data-id="${convert.id}">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="delete-btn" data-id="${convert.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>`;

            // По клику по заголовку показываем/скрываем описание, если не редактируем
            const header = newConvert.querySelector('.convert-header');
            const description = newConvert.querySelector('.convert-description');
            header.addEventListener('click', () => {
                if (isEditing) return;
                description.classList.toggle('show');
            });

            container.appendChild(newConvert);
        });
    } else {
        container.innerHTML = '<p>Your request returned no converts</p>';
    }
}

// Делегирование событий на container
container.addEventListener('click', event => {
    const editBtn = event.target.closest('.edit-btn');
    const saveBtn = event.target.closest('.save-btn');
    const deleteBtn = event.target.closest('.delete-btn');
    const depositBtn = event.target.closest('.deposit-btn');
    const withdrawBtn = event.target.closest('.withdraw-btn');
    const transferBtn = event.target.closest('.transfer-btn');

    if (editBtn) {
        if (isEditing) return; // Запретить редактирование, если уже редактируем
        isEditing = true;

        const convertDiv = editBtn.closest('.convert');
        const id = editBtn.getAttribute('data-id');
        const headerElem = convertDiv.querySelector('.convert-header');
        const textElems = convertDiv.querySelectorAll('.convert-text');
        const [idText, convertText] = [...textElems];

        const headerValue = headerElem.textContent;
        const convertValue = convertText.textContent.replace('Description: ', '');

        // Замена на input
        headerElem.innerHTML = `<input type="text" class="edit-header" value="${headerValue}">`;
        convertText.innerHTML = `Description: <input type="text" class="edit-convert" value="${convertValue}">`;

        // Создаем кнопку сохранить
        const newSaveBtn = document.createElement('button');
        newSaveBtn.className = 'save-btn';
        newSaveBtn.setAttribute('data-id', id);
        newSaveBtn.innerHTML = '<i class="fas fa-save"></i>';

        editBtn.replaceWith(newSaveBtn);
        return;
    }

    if (saveBtn) {
        if (!isEditing) return;
        const convertDiv = saveBtn.closest('.convert');
        const id = saveBtn.getAttribute('data-id');

        const newHeaderValue = convertDiv.querySelector('.edit-header').value;
        const newConvertValue = convertDiv.querySelector('.edit-convert').value;

        fetch(`/api/envelopes/${id}?header=${encodeURIComponent(newHeaderValue)}&convert=${encodeURIComponent(newConvertValue)}`, {
            method: 'PUT'
        })
            .then(response => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(() => {
                const headerElem = convertDiv.querySelector('.convert-header');
                const textElems = convertDiv.querySelectorAll('.convert-text');
                const [idText, convertText] = [...textElems];

                headerElem.textContent = newHeaderValue;
                convertText.textContent = `Description: ${newConvertValue}`;

                // Создаем кнопку редактировать
                const newEditBtn = document.createElement('button');
                newEditBtn.className = 'edit-btn';
                newEditBtn.setAttribute('data-id', id);
                newEditBtn.innerHTML = '<i class="fas fa-pen"></i>';

                saveBtn.replaceWith(newEditBtn);
                isEditing = false;
            })
            .catch(err => {
                if (err.status) {
                    err.json().then(json => renderError(err));
                } else {
                    console.error(err);
                }
                isEditing = false;
            });

        return;
    }

    if (deleteBtn) {
        if (isEditing) return; // не даем удалить во время редактирования
        const id = deleteBtn.getAttribute('data-id');
        const convertDiv = deleteBtn.closest('.convert');

        fetch(`/api/envelopes/${id}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(() => {
                convertDiv.remove();
            })
            .catch(err => {
                if (err.status) {
                    err.json().then(json => renderError(err));
                } else {
                    console.error(err);
                }
            });

        return;
    }

    if (depositBtn) {
        if (isEditing) return;
        const convertDiv = depositBtn.closest('.convert');
        const id = depositBtn.getAttribute('data-id');
        const header = convertDiv.querySelector('.convert-header').textContent;
        createPopup({
            title: `Deposit to ${header}`,
            inputs: [
                { label: 'Deposit:', type: 'number', id: 'deposit', value: '' }
            ],
            buttons: [
                {
                    text: 'Apply Deposit',
                    className: 'apply-button',
                    onClick: (e, { overlay }) => {
                        const depositInput = overlay.querySelector('#deposit');
                        const depositValue = depositInput.value;
                        fetch(`/api/envelopes/${id}?action=deposit&amount=${depositValue}`, {
                            method: 'PUT'
                        })
                        .then(response => {
                            if(response.ok) {
                                location.reload();
                                return response.json();
                            } else {
                                response.json().then(err => alert(err.message));
                            }
                        })
                        .catch(err => console.error(err));
                    }
                }
            ]
        });
    }

    if (withdrawBtn) {
        if (isEditing) return;
        const convertDiv = withdrawBtn.closest('.convert');
        const id = withdrawBtn.getAttribute('data-id');
        const header = convertDiv.querySelector('.convert-header').textContent;
        createPopup({
            title: `Withdraw balance from ${header}`,
            inputs: [
                { label: 'Withdraw:', type: 'number', id: 'withdraw', value: '' }
            ],
            buttons: [
                {
                    text: 'Apply Withdraw',
                    className: 'apply-button',
                    onClick: (e, { overlay }) => {
                        const withdrawInput = overlay.querySelector('#withdraw');
                        const withdrawValue = withdrawInput.value;
                        fetch(`/api/envelopes/${id}?action=withdraw&amount=${withdrawValue}`, {
                            method: 'PUT'
                        })
                        .then(response => {
                            if(response.ok) {
                                return response.json();
                            } else {
                                response.json().then(err => alert(err.message));
                            }
                        })
                        .then(()=> {
                            location.reload();
                        })
                        .catch(err => console.error(err));
                        
                    }
                }
            ]
        });
    }

    if (transferBtn) {
        if (isEditing) return;
        const convertDiv = transferBtn.closest('.convert');
        const fromId = transferBtn.getAttribute('data-id');
        const header = convertDiv.querySelector('.convert-header').textContent;
    
        createPopup({
            title: `Transfer from ${header}`,
            inputs: [
                { 
                    label: 'Amount to transfer:', 
                    type: 'number', 
                    id: 'transfer-amount', 
                    value: '' 
                },
                { 
                    label: 'Destination ID:', 
                    type: 'number', 
                    id: 'to-id', 
                    value: '' 
                }
            ],
            buttons: [
                {
                    text: 'Confirm Transfer',
                    className: 'apply-button',
                    onClick: (e, { overlay }) => {
                        const amountInput = overlay.querySelector('#transfer-amount');
                        const toIdInput = overlay.querySelector('#to-id');
                        const amount = amountInput.value;
                        const toId = toIdInput.value;
    
                        fetch(`/api/envelopes/transfer/${fromId}/${toId}?amount=${amount}`, {
                            method: 'PUT'
                        })
                        .then(response => {
                            if (response.ok) {
                                location.reload(); // Обновить интерфейс
                            } else {
                                response.json().then(err => alert(err.message));
                            }
                        })
                        .catch(err => console.error(err));
                    }
                }
            ]
        });
    }

});
  
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

  openBtn.addEventListener('click', () => {
    createPopup({
        title: 'Set your Budget',
        inputs: [
            { label: 'Budget:', type: 'number', id: 'budget', value: '' }
        ],
        buttons: [
            {
                text: 'Apply Budget',
                className: 'apply-button',
                onClick: (e, { overlay }) => {
                    const budgetInput = overlay.querySelector('#budget');
                    const budgetValue = Number(budgetInput.value);
                    if (isNaN(budgetValue)) {
                        alert('Budget must be a number');
                        return;
                    }
                    fetch(`/api/envelopes/budget/${budgetValue}`, {
                        method: 'PUT'
                    })
                    .then(response => {
                        if(response.ok) {
                            return response.json();
                        } else {
                            renderError(response);
                        }
                    })
                    .then(response => {
                        renderBudget(response);
                    })
                    document.body.removeChild(overlay);
                }
            }
        ]
    });
});