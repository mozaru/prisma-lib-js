import Table from 'prisma-js/table';
import Form, { required, cpf, phone } from 'prisma-js/form';
import Http from 'prisma-js/http';
import { showMessage, prompt, confirm } from 'prisma-js';

import { Geolocation } from '@capacitor/geolocation';

Geolocation.getCurrentPosition().then(pos => {
  console.log('Minha posição', pos);
});

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
  } else if (cpf()(field.value) != null) {
    originalForm.addError(field, 'Invalid CPF');
  }
  field = document.getElementById('phone');
  if (!field.value) {
    originalForm.addError(field, "Phone is required");
  } else if (phone()(field.value) != null) {
    originalForm.addError(field, 'Invalid phone');
  }
  return originalForm.valid;
}

window.saveOriginal = function () {
  if (!validate()) return originalForm.showErrors();
  console.log('POST', {
    name: document.getElementById('name').value,
    cpf: document.getElementById('cpf').value
  });
}

const [_, f] = document.forms
const newForm = new Form(f, {
  name: {
    initialValue: '',
    validators: [required('Nome é obrigatório')]
  },
  cpf: {
    initialValue: '271.326.330-15',
    validators: [required(), cpf('CPF inválido')]
  },
  phone: {
    initialValue: '',
    validators: [required(), phone('Telefone inválido')]
  }
})

window.saveNew = function () {
  if (newForm.valid) {
    console.log('POST ', newForm.value);
  }
}

window.testHttp = async function() {
  try {
    const http = new Http('http://localhost:8080/api/');
    try {
      const data = await http.get('vehicle/list/1');
      console.log(data);
    } catch (err) {
      console.error(err);
    }
    let data = await http.post('account/login', {
      username: "15.489.782/0001-41",
      password: "123"
    });
    localStorage.setItem('authentication', JSON.stringify(data))
    data = await http.get('vehicle/list/1');
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

window.testModal = async function() {
  if (await confirm("Realmente deseja testar as modais?")) {
    const valor = await prompt("Me de um valor!!", null, "Confirmar");
    showMessage(valor || 'Testando show message', '', () => alert('Tudo certo.'));
  }
}
