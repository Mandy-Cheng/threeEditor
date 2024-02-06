import { resize } from "./modules/resize";

const directivesList: any = {
  resize,
};

const directives = {
  install(app: any) {
    for (const key in directivesList) {
      app.directive(key, directivesList[key]);
    }
  },
};

export default directives;
