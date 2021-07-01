import * as props from "./props"
import { isBrowser } from "./utils"

export const App = function(websiteId, options) {
  this.websiteId = websiteId;
  this.options = options || {};
}