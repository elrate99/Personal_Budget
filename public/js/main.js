const fetchAllConverts = document.getElementById('fetch-converts');
const fetchById = document.getElementById('fetch-by-id');
const fetchByName = document.getElementById('fetch-by-name');
const container = document.querySelector('.convert-container');

const resetConverts = () => {
    container.innerHTML = '';
}

document.querySelectorAll('.convert').forEach((convertBlock) => {
    const header = convertBlock.querySelector('.convert-header');
    const description = convertBlock.querySelector('.convert-description');
  
    header.addEventListener('click', () => {
      description.classList.toggle('show');
    });
  });
  