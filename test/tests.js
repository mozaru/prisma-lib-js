import Table from '../table';
import Form from '../form';
import Http from '../http';
import { showMessage } from '../utils';

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
  for(const child of children) {
    child.remove()
  }
  
  for(const item of table.getSelectedRows()) {
    const div = document.createElement('div')
    div.innerText = JSON.stringify(item)
    container.appendChild(div)
  }
}

window.filter = function() {
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

window.saveOriginal = function() {
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

const [_,f] = document.forms
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

window.saveNew = function() {
  if (newForm.valid) {
    console.log('POST ', newForm.value);
  }
}

const http = new Http('https://www.mobilidadec3.com.br/api/');
localStorage.setItem('autentication', JSON.stringify({
  token_type: "Bearer",
  access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMiLCJ1c2VybmFtZSI6IjE1LjQ4OS43ODIvMDAwMS00MSIsInJvbGUiOiJjb21wYW55IiwibmJmIjoxNjg4NTk4NzU4LCJleHAiOjE2ODg2MDExNTgsImlhdCI6MTY4ODU5ODc1OH0.nMsz7oYDgPbR9KlVM2DiQl6thFvixCEDltDasWQkxNo",
  refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMiLCJ1c2VybmFtZSI6IjE1LjQ4OS43ODIvMDAwMS00MSIsInJvbGUiOiJjb21wYW55IiwibmJmIjoxNjg4NTk4NzU4LCJleHAiOjE2ODg2Mjc1NTgsImlhdCI6MTY4ODU5ODc1OH0.vbbseOJ73Ahr_wj7rrozC31uUdIHEXcqU1qZjjMgG6U"
}))
http.get('vehicles/3', (data) => console.log('GET vehicles:', data))

showMessage('Testando show message', '', () => alert('testado'))