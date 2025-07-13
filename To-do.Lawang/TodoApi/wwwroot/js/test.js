let uri = 'http://localhost:5263/ToDoItems';
let todos = [];

function getItems() {
    fetch(uri)
        .then(response => response.json())
        .then(data => _displayItems(data))
        .catch(error => console.error('unable to get items.', error));
}

function displayEdit(id) {

    let updateGroup = document.querySelectorAll(`.updateGroup${id}`);
    updateGroup.forEach(child => {
        child.style.display = 'none';
    })

    let editGroup = document.querySelectorAll(`.editGroup${id}`);
    editGroup.forEach(child => {
        child.style.display = 'block';
    });
    let checkbox = document.querySelector(`.checkbox${id}`);
    checkbox.disabled = false;
    let editTodo = document.querySelector(`#todo${id}`);
    let task = editTodo.childNodes[1].firstChild;
    task.disabled = false;
    task.style.border = 'solid';

}

function discardEdit(id) {
    let editGroup = document.querySelectorAll(`.editGroup${id}`);
    editGroup.forEach(child => {
        child.style.display = 'none';
    });

    let updateGroup = document.querySelectorAll(`.updateGroup${id}`);
    updateGroup.forEach(child => {
        child.style.display = 'block';
    })

    let checkbox = document.querySelector(`.checkbox${id}`);

    let editTodo = document.querySelector(`#todo${id}`);
    let task = editTodo.childNodes[1].firstChild;
    let value = todos.find((item) => item.id === (id));

    task.value = value.name;
    checkbox.checked = value.isComplete;
    checkbox.disabled = true;

    task.disabled = true;
    task.style.border = 'none';



}

function saveUpdate(id) {
    let todo = document.querySelector(`.todo${id}`).value;
    let isComplete = document.querySelector(`.checkbox${id}`).checked;

    let item = {
        id: id,
        name: todo,
        isComplete: isComplete
    };

    fetch(`${uri}/${id}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    })
        .then(() => {
            getItems();
            Swal.fire({
                title: "Update Successful!",
                icon: "success",
                draggable: true
            });
        })
        .catch(error => {
            console.error('Unable to update Item.', error);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error,
            })
            discardEdit(id);
        })
}

function deleteTodo(id) {
    console.log("deleteId : " + id);
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${uri}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'applcation/json'
                }
            }).then((response) => {
                if (response.ok) {
                    Swal.fire({
                        title: "Deleted!",
                        text: "Your file has been deleted.",
                        icon: "success"
                    });
                    getItems();
                }
            })
                .catch(error =>
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: error,
                    })
                )

        }
    });
}

function _displayItems(data) {
    let tbody = document.getElementById('todos');
    tbody.innerHTML = '';


    data.forEach(item => {
        let tr = tbody.insertRow();
        tr.id = `todo${item.id}`;
        let isCompleteCheckbox = document.createElement('input');
        isCompleteCheckbox.type = 'checkbox';
        isCompleteCheckbox.id = 'flexCheckDefault';
        isCompleteCheckbox.className = `form-check-input pt-2 checkbox${item.id}`;
        isCompleteCheckbox.checked = item.isComplete;
        isCompleteCheckbox.disabled = true;


        let task = document.createElement('input');
        task.className = `font-weight-bold mb-0 form-control todo${item.id}`;
        task.value = item.name;
        task.disabled = true;
        task.style.outline = 'none';
        task.style.border = 'none';
        task.style.background = 'transparent';

        let btnGroup = document.createElement('div');
        btnGroup.className = 'd-flex flex-row justify-content-end mb-1';

        let editbtn = document.createElement('button');
        editbtn.className = `btn btn-primary mx-1 updateGroup${item.id}`;
        editbtn.innerHTML = '<i class="bi bi-pencil"></i> EDIT';
        editbtn.setAttribute('onclick', `displayEdit(${item.id})`);

        btnGroup.appendChild(editbtn);

        let delbtn = document.createElement('button');
        delbtn.className = `btn btn-danger mx-1 updateGroup${item.id}`;
        delbtn.innerHTML = '<i class="bi bi-trash"></i> DELETE';
        delbtn.setAttribute('onclick', `deleteTodo(${item.id})`);

        btnGroup.appendChild(delbtn);

        let savebtn = document.createElement('button');
        savebtn.className = `btn btn-primary mx-1 editGroup${item.id}`;
        savebtn.innerHTML = '<i class="bi bi-save"></i> SAVE';
        savebtn.style.display = 'none';
        savebtn.setAttribute('onclick', `saveUpdate(${item.id})`);

        btnGroup.appendChild(savebtn);

        let discardbtn = document.createElement('button');
        discardbtn.className = `btn btn-danger mx-1 editGroup${item.id}`;
        discardbtn.innerHTML = '<i class="bi bi-x-square"></i> DISCARD';
        discardbtn.setAttribute('onclick', `discardEdit(${item.id})`);
        discardbtn.style.display = 'none';

        btnGroup.appendChild(discardbtn);


        let td1 = tr.insertCell(0);
        td1.appendChild(isCompleteCheckbox);

        let td2 = tr.insertCell(1);
        td2.appendChild(task);

        let td3 = tr.insertCell(2);
        td3.appendChild(btnGroup);

    })

    todos = data;
    console.log(todos);
}

function addItem() {
    let todo = document.getElementById('inputToDo');

    const item = {
        isComplete: false,
        name: todo.value
    }
    fetch(uri, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    }).then(response => response.json())
        .then(() => {
            getItems();
            todo.value = '';
        })

}

