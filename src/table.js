import { 
  formatInt, 
  formatReal, 
  formatCurrency,
  formatDate, 
  formatDateTime 
} from "./utils/format";
export default class PrismaTable {
  #table;
  #tbody;
  #columns;
  #operations;
  #filterContent = "";
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
            if (typeof col.onchange == 'function') {
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
    operations.forEach((op) => {
      if (!op.Visible || (typeof op.Visible == 'function' && op.Visible())) {
        op.visible = true;
        const cell = row.insertCell();
        cell.innerHTML = "";
      }
    });
    this.#tbody = table.tBodies[0] || table.createTBody();
  }

  #clearRows() {
    const rows = [...this.#tbody.rows];
    for (const row of rows) {
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

  #formatCell(col, obj) {
    const type = (col.Type || '').toLowerCase();
    switch (type) {
      case 'currency':
        return formatCurrency(obj[col.Field], col.Symbol);
      case 'int':
        return formatInt(obj[col.Field]);
      case 'real':
        return formatReal(obj[col.Field], col.Digits);
      case 'date':
        return formatDate(obj[col.Field], col.NA);
      case 'datetime':
        return formatDateTime(obj[col.Field], col.NA);
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
            const inputs = [...this.#tbody.querySelectorAll('tr:not([style*="display: none"]) input')];
            const inputAll = this.#table.tHead.querySelector('input');
            if (inputs.every(i => i.checked)) {
              inputAll.checked = true;
            } else {
              inputAll.checked = false;
            }
            if (typeof col.onchange == 'function') {
              col.onchange({
                scope: 'single',
                checked: e.target.checked,
                value: [obj]
              });
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
      if (col.visible) {
        const cell = row.insertCell();
        const btn = document.createElement("button");
        if (typeof col.Disable == 'function')
          btn.disabled = col.Disable(obj);
        btn.type = 'button';
        cell.appendChild(btn);
        btn.classList = "tool-btn " + col.Class;
        btn.title = col.Label;
        btn.addEventListener('click', () => {
          if (typeof col.Action == 'function')
            col.Action(obj);
        });
      }
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
    if (typeof content == 'string') {
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