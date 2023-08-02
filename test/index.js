import Table from 'prisma-js/table';
import Form from 'prisma-js/form';
import Http from 'prisma-js/http';
import { showMessage } from 'prisma-js';

let table = new Table(
  document.getElementById("tbl"),
  [
    {
      Type: 'select',
      onchange: readSelected
    },
    {
      Label: "Start date",
      Field: "StartDate",
      Type: "datetime",
    },
    {
      Label: "Distance (km)",
      Field: "DistanceInKm",
      Type: "real",
      Digits: 3,
    },
  ],
  []
)

table.setRows([{
  StartDate: new Date(),
  DistanceInKm: 1.15987
},
{
  StartDate: new Date(new Date().setMonth(7)),
  DistanceInKm: 2.15987
},
{
  StartDate: new Date(new Date().setHours(21)),
  DistanceInKm: 3.15987
}])

function readSelected() {
  const container = document.getElementById('container')
  const children = [...container.children]
  for (const child of children) {
    child.remove()
  }

  for (const item of table.getSelectedRows()) {
    const div = document.createElement('div')
    div.innerText = JSON.stringify(item)
    container.appendChild(div)
  }
}

window.filter = function () {
  const search = document.getElementById('filter').value;
  table.filter(search);
}

const originalForm = new Form()

function validate() {
  originalForm.hideErrors()
  let field = document.getElementById('name');
  if (!field.value) {
    originalForm.addError(field, "Name is required");
  }
  field = document.getElementById('cpf');
  if (!field.value) {
    originalForm.addError(field, "CPF is required");
  }
  return originalForm.errors.length == 0;
}

window.saveOriginal = function () {
  if (!validate()) return originalForm.showErrors();
  console.log('POST', {
    name: document.getElementById('name').value,
    cpf: document.getElementById('cpf').value
  });
}

function required(value) {
  return value ? null : 'Required'
}

function cpf(value) {
  return value == '271.326.330-15' ? null : 'Invalid CPF'
}

const [_, f] = document.forms
const newForm = new Form(f, {
  name: {
    initialValue: '',
    validators: [required]
  },
  cpf: {
    initialValue: '271.326.330-15',
    validators: [required, cpf]
  }
})

window.saveNew = function () {
  if (newForm.valid) {
    console.log('POST ', newForm.value);
  }
}

async function testHttp() {
  try {
    const http = new Http('http://localhost:1080/api/');
    try {
      const data = await http.get('vehicles/3');
      console.log(data);
    } catch (err) {
      console.error(err);
    }
    let data = await http.post('account/login', {
      username: "15.489.782/0001-41",
      password: "1234"
    });
    localStorage.setItem('authentication', JSON.stringify(data))
    data = await http.get('vehicles/3');
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
testHttp();

showMessage('Testando show message', '', () => alert('testado'))