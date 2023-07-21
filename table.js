export default class PrismaTable {
  #table;
  #tbody;
  #columns;
  #operations;
  #filterContent = null;
  #values = [];
  #lastIndexColSort = -1;
  #lastDirectionSort = false;

  constructor(table, columns, operations) {
    this.#table = table;
    this.#columns = columns;
    this.#operations = operations;
    table.deleteTHead();
    const header = table.createTHead();
    const row = header.insertRow();
    columns.forEach((col, index) => {
      const cell = row.insertCell();
      if (col.Label) {
        cell.innerHTML = col.Label;
      }
      if (col.Type) {
        const type = col.Type.toLowerCase()
        if (type == 'currency' || type == 'real' || type == 'int') {
          cell.style.textAlign = 'right';
        } else if (type == 'select') {
          const input = document.createElement('input');
          cell.appendChild(input);
          input.type = 'checkbox'
          input.addEventListener('change', (e) => {
            const objs = [];
            for (const row of this.#tbody.querySelectorAll(`tr:not([style*="display: none"])`)) {
              objs.push(row.obj);
              const input = row.querySelector('input');
              input.checked = e.target.checked;
            }
            if (col.onchange && typeof col.onchange == 'function') {
              col.onchange({
                scope: 'all',
                checked: e.target.checked,
                value: objs
              });
            }
          });
        }
      }
      if (col.Width) cell.style.width = `${col.Width}px`;
      if (col.Align) cell.style.textAlign = col.Align;
      if (!col.Type || col.Type !== 'select') {
        cell.addEventListener('click', () => {
          if (this.#lastIndexColSort != index) {
            this.#lastDirectionSort = true;
            this.#lastIndexColSort = index;
          } else if (this.#lastDirectionSort) {
            this.#lastDirectionSort = !this.#lastDirectionSort;
          } else if (!this.#lastDirectionSort) {
            this.#lastIndexColSort = -1;
          }
          this.#sortByColumnIndex(this.#lastIndexColSort, this.#lastDirectionSort);
        });
      }
    });
    operations.forEach(() => {
      const cell = row.insertCell();
      cell.innerHTML = "";
    });
    this.#tbody = table.tBodies[0] || table.createTBody();
  }

  #clearRows() {
    for (const row of this.#tbody.rows) {
      row.remove();
    }
  }

  setRows(data) {
    this.#clearRows();
    this.#values = [...data];
    for (const obj of data) {
      this.#addRow(obj);
    }
    if (this.#lastIndexColSort >= 0) {
      this.#sortByColumnIndex(this.#lastIndexColSort, this.#lastDirectionSort);
    }
  }

  #adjustColumnName(col, obj) {
    if (!col.Field || col.Field in obj) {
      return;
    }
    const name = col.Field.replace(/[^a-z0-9]/gi, '').toLowerCase();
    for (const prop in obj)
      if (name == prop.replace(/[^a-z0-9]/gi, '').toLowerCase()) {
        col.Field = prop;
        return;
      }
  }
  #formatCurrency(value, symbol) {
    return `${symbol} ${formatReal(value, 2)}`;
  }

  #formatReal(value, digits) {
    if (!value)
      value = 0;
    return parseFloat(parseFloat(value).toFixed(digits)).toLocaleString();
  }

  #formatInt(value) {
    if (!value)
      value = 0;
    return parseInt(value).toString();
  }

  #formatDate(value) {
    if (!value)
      value = new Date("");
    else if (typeof value == 'string')
      value = new Date(value);
    return value.toLocaleDateString()
  }

  #formatDateTime(value) {
    if (!value)
      value = new Date("");
    else if (typeof value == 'string')
      value = new Date(value);
    return value.toLocaleString()
  }

  #formatCell(col, obj) {
    const type = col.Type.toLowerCase();
    switch (type) {
      case 'currency':
        return this.#formatCurrency(obj[col.Field], col.Symbol);
      case 'int':
        return this.#formatInt(obj[col.Field]);
      case 'real':
        return this.#formatReal(obj[col.Field], col.Digits);
      case 'date':
        return this.#formatDate(obj[col.Field]);
      case 'datetime':
        return this.#formatDateTime(obj[col.Field]);
      default:
        return obj[col.Field].toLocaleString();
    }
  }

  #addRow(obj) {
    const row = this.#tbody.insertRow();
    row.obj = obj;
    for (const col of this.#columns) {
      const cell = row.insertCell();
      this.#adjustColumnName(col, obj);
      if (col.Type) {
        const type = col.Type.toLowerCase();
        if (type == 'img') {
          cell.innerHTML = `<img src='${obj[col.Field]}' width='${col.Width}px' height='${col.Width}px' onerror='if (this.src != "./foto/notfound.png") this.src = "./foto/notfound.png";'/>`;
        } else if (type == 'select') {
          const input = document.createElement('input');
          cell.appendChild(input);
          input.type = 'checkbox'
          input.addEventListener('change', (e) => {
            if (e.isTrusted) {
              const inputs = [...this.#tbody.querySelectorAll('tr:not([style*="display: none"]) input')];
              const inputAll = this.#table.tHead.querySelector('input');
              if (inputs.every(i => i.checked == e.target.checked)) {
                inputAll.checked = e.target.checked;
              } else {
                inputAll.checked = false;
              }
              if (col.onchange && typeof col.onchange == 'function') {
                col.onchange({
                  scope: 'single',
                  checked: e.target.checked,
                  value: [obj]
                });
              }
            }
          });
        } else {
          cell.innerHTML = this.#formatCell(col, obj);
          if (type == 'currency' || type == 'int' || type == 'real') {
            cell.style.textAlign = 'right';
          }
        }
      } else {
        cell.innerHTML = obj[col.Field];
      }
      if (col.Width) cell.style.width = `${col.Width}px`;
      if (col.Align) cell.style.textAlign = col.Align;
    }
    for (const col of this.#operations) {
      const cell = row.insertCell();
      const btn = document.createElement("button");
      cell.appendChild(btn);
      btn.classList = "tool-btn " + col.Class;
      btn.title = col.Label;
      btn.addEventListener('click', () => {
        if (col.Action && typeof col.Action == 'function')
          col.Action(obj);
      });
    }
  }

  #passFilter(obj) {
    if (!this.#filterContent) {
      return true;
    }
    for (const col of this.#columns)
      if (obj[col.Field] && this.#formatCell(col, obj).toLowerCase().includes(this.#filterContent))
        return true;
    return false;
  }

  filter(content) {
    this.#filterContent = content.toLowerCase();
    for (const row of this.#tbody.children) {
      const input = row.querySelector('input[type="checkbox"]');
      if (this.#passFilter(row.obj)) {
        row.style = "display: ;";
      } else {
        row.style = "display: none;";
        if (input && input.checked) {
          input.checked = false;
        }
      }
      if (input) {
        input.dispatchEvent(new Event('change'));
      }
    }
  }

  #sortByKeyAsc(array, key) {
    return array.sort(function (a, b) {
      var x = a[key];
      var y = b[key];
      return x < y ? -1 : x > y ? 1 : 0;
    });
  }

  #sortByKeyDesc(array, key) {
    return array.sort(function (a, b) {
      var x = a[key];
      var y = b[key];
      return x < y ? 1 : x > y ? -1 : 0;
    });
  }

  #sortByColumnIndex(indexCol, asc) {
    this.#lastIndexColSort = indexCol;
    this.#lastDirectionSort = asc;
    const sortedValues = [...this.#values];
    if (indexCol >= 0) {
      asc
        ? this.#sortByKeyAsc(sortedValues, this.#columns[indexCol].Field)
        : this.#sortByKeyDesc(sortedValues, this.#columns[indexCol].Field);
    }
    this.#clearRows()
    for (const obj of sortedValues) {
      this.#addRow(obj);
    }
    this.filter(this.#filterContent);
  };

  getSelectedRows() {
    const result = [];
    for (const row of this.#tbody.querySelectorAll(`tr:not([style*="display: none"]):has(input:checked)`)) {
      result.push(row.obj);
    }
    return result;
  }
}