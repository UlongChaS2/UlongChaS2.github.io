"use strict";
exports.id = "component---src-templates-markdown-template-js";
exports.ids = ["component---src-templates-markdown-template-js"];
exports.modules = {

/***/ "./src/templates/markdown-template.js?export=default":
/*!***********************************************************!*\
  !*** ./src/templates/markdown-template.js?export=default ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

const MarkdownTemplate = ({
  data
}) => {
  const post = data.markdownRemark;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h1", null, post.frontmatter.title), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, post.frontmatter.date), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    dangerouslySetInnerHTML: {
      __html: post.html
    }
  }));
};
const query = "1056789314";
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MarkdownTemplate);

/***/ })

};
;
//# sourceMappingURL=component---src-templates-markdown-template-js.js.map