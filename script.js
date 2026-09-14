const btn = document.querySelector(`#greetBtn`)
const btnTheme = document.querySelector(`#themeBtn`)
const btnShow = document.querySelector(`#showBtn`)
const title = document.querySelector(`h1`)

let countClick = 0;


btn.addEventListener('click', function() {
    btn.textContent = "Привет!"
    countClick += 1
})


btnShow.addEventListener('click', function () {
    alert(`Кнопка была нажата - ${countClick} раз`)
})

btnTheme.addEventListener('click', function () {
    if (document.body.style.backgroundColor === 'rgb(34, 34, 34)') {
        document.body.style.backgroundColor = ''
        document.body.style.color = ''
        currentTheme.textContent = 'Светлая'
    } else {
        document.body.style.backgroundColor = '#111111'
        document.body.style.color = '#fff'
        currentTheme.textContent = 'Темная'
    }
})

