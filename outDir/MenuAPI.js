//MenuAPI.js

class Menu {
  constructor() {
    this.menuItems = [];
  }

  addMenuItemAt(menuItem, index) {
    this.menuItems.splice(index, 0, menuItem);
  }

  removeMenuItem(menuItem) {
    this.menuItems = this.menuItems.filter((item) => item !== menuItem);
  }

  createMenu(x, y) {
    this.hideMenu();
    const menu_ul = document.createElement("ul");
    menu_ul.classList.add("menu");

    // const items = this.menuItems;

    // Loop through the items and create <li> elements for each
    this.menuItems.forEach((item) => {
      menu_ul.appendChild(item.render(this));
    });
    // // https://www.youtube.com/watch?v=7Iadn0Rm2T8&list=PLXrtIoYgTeIv-JLEe5u9L-q970kMgcZOV&index=2&t=301s ------
    menu_ul.style.top = `${y - 20}px`;
    menu_ul.style.left = `${x - 20}px`;
    menu_ul.classList.remove("off");
    menu_ul.style.display = "block";
    this.menu = menu_ul;

    // Append the menu to the body or another element in the document
    document.body.appendChild(menu_ul);

    this.hideEvent = (event) => {
      if (this.menu && !this.menu.contains(event.target)) {
        event.stopPropagation();
        this.hideMenu();
      }
    };
    document.addEventListener("click", this.hideEvent, true);
  }

  hideMenu() {
    if (this.menu) {
      this.menu.remove();
      document.removeEventListener("click", this.hideEvent, true);
    }
  }
}

class MenuItem {
  constructor(itemLabel, action) {
    this.itemLabel = itemLabel;
    this.action = action;
  }

  render(menu) {
    const li = document.createElement("li");
    li.classList.add("menu-item");
    li.textContent = this.itemLabel;
    li.addEventListener("click", (event) => {
      this.action(menu); // Call the action function for the menu item - ex: setColor
    });
    return li;
  }
}

class Separator {
  render(menu) {
    return document.createElement("hr");
  }
}

// with help from GPT
class RadioMenuItem extends MenuItem {
  constructor(itemLabel, options, passedFunction = null) {
    super(itemLabel, null); // No default action
    this.options = options; // This should be an object of keys to { label, action } objects
    this.passedFunction = passedFunction; // This should be a key in the options object
  }

  render(menu) {
    const li = document.createElement("li");
    li.classList.add("menu-item");
    li.textContent = this.itemLabel;

    const form = document.createElement("form");
    Object.entries(this.options).forEach(([key, option], index) => {
      const radioInput = document.createElement("input");
      radioInput.type = "radio";
      radioInput.name = this.itemLabel.toLowerCase().replace(/\s/g, "-");
      radioInput.value = key;
      radioInput.id = `${this.itemLabel
        .toLowerCase()
        .replace(/\s/g, "-")}-${index}`;
      radioInput.checked = key === this.passedFunction;

      const label = document.createElement("label");
      label.htmlFor = radioInput.id;
      label.textContent = option.label;

      const wrapper = document.createElement("div");
      wrapper.appendChild(radioInput);
      wrapper.appendChild(label);
      form.appendChild(wrapper);

      // Ensure `option.action` is a function before assigning it
      if (typeof option.action === "function") {
        radioInput.addEventListener("change", () => {
          if (radioInput.checked) {
            console.log(
              `Radio button ${option.label} selected, triggering action.`
            );
            option.action();
            // menu.hideMenu();
          }
        });
      }
    });

    li.appendChild(form);
    return li;
  }
}

export { Menu, MenuItem, Separator, RadioMenuItem };
