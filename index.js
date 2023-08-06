import * as readline from "node:readline";
import { writeFileSync } from "node:fs";
import { open } from "node:fs/promises";
import { stdin as input, stdout as output } from "node:process";
import chalk from "chalk";

const FILE_PATH = "./todo.csv";
const log = console.log;
const rl = readline.createInterface({ input, output });
const menuColor = chalk.yellowBright;




let currentId = 1;
function Todo(title, description) {
  return {
    id: currentId++,
    title,
    description,
    completed: false,
  };
}

let todolist = (await stringToArray()) || [
  Todo("Programaar", "Hacer una todo app"),
  Todo("Desayuno", "Comer una ensalada"),
  Todo("Tarea", "Grabar el poema: muerte sin fin"),
];

async function stringToArray() {
  try {
    const file = await open(FILE_PATH);

    const todolist = [];

    for await (const line of file.readLines()) {
      const [id, title, description, _completed] = line.split(",");
      todolist.push({
        id,
        title,
        description,
        completed: _completed == "true",
      });
      currentId++;
    }

    if (!todolist.length) throw {};

    return todolist;
  } catch (err) {
    return null;
  }
}

function arrayToString() {
  let res = "";
  todolist.forEach(
    (todo) =>
      (res += `${todo.id},${todo.title},${todo.description},${todo.completed}\n`)
  );

  return res;
}

function findAll(showMenu) {
  log(chalk.red("-- Lista de Tareas --"));

  todolist.forEach((todo) => {
    log(chalk.yellow(` ${todo.completed === true ? "✅" : "✗"} ${todo.title}`));
    log(chalk.yellow(`|__ #${todo.id}. Descripcion: ${todo.description} `));
    log();
  });
  if (showMenu) {
    menu();
    chooseOption();
  }
}

function onlyPending() {
  todolist
    .filter((todo) => !todo.completed)
    .forEach((todo) => {
      log(
        chalk.yellow(` ${todo.completed === true ? "✅" : "✗"} ${todo.title}`)
      );
      log(chalk.yellow(`|__ #${todo.id}. Descripcion: ${todo.description} `));
      log();
    });
  menu();
  chooseOption();
}

function create() {
  rl.question("Elige el titulo: ", (title) => {
    rl.question("Elige la desription: ", (description) => {
      todolist.push(Todo(title, description));
      log("Se ha agregado la tarea");
      findAll();
      menu();
      chooseOption();
    });
  });
}

function complete() {
  findAll();
  rl.question("Elige el numero de tarea a completar: #", (id) => {
    todolist.find((todo) => todo.id == id).completed = true;
    log("Se ha completado la tarea #" + id);
    findAll(false);
    menu();
    chooseOption();
  });
}

function menu() {
  log(chalk.green("TODO App CLI"));
  log(menuColor("0. Salir"));
  log(menuColor("1. Mostrar Tareas"));
  log(menuColor("2. Agregar Tarea"));
  log(menuColor("3. Completar Tarea"));
  log(menuColor("4. Mostrar Solo Pendientes"));
}

function chooseOption() {
  rl.question("Elige una opcion: ", async (choice) => {
    switch (choice) {
      case "0":
        log("Chauuu");
        rl.close();
        return;
      case "1":
        findAll(true);
        break;
      case "2":
        create();
        break;
      case "3":
        complete();
        break;
      case "4":
        onlyPending();
        break;
      default:
        log(chalk.red("OPCION INVALIDA"));
        menu();
        chooseOption();
        break;
    }
  });
}

rl.on("close", () => {
  log("✌");

  writeFileSync(FILE_PATH, arrayToString(), {
    encoding: "utf-8",
  });
});

menu();
chooseOption();