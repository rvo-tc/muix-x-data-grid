"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bgBG = void 0;

var _locale = require("@mui/material/locale");

var _getGridLocalization = require("../utils/getGridLocalization");

const bgBGGrid = {
  // Root
  noRowsLabel: 'Няма редове',
  noResultsOverlayLabel: 'Няма намерени резултати.',
  errorOverlayDefaultLabel: 'Възникна грешка.',
  // Density selector toolbar button text
  toolbarDensity: 'Гъстота',
  toolbarDensityLabel: 'Гъстота',
  toolbarDensityCompact: 'Компактна',
  toolbarDensityStandard: 'Стандартна',
  toolbarDensityComfortable: 'Комфортна',
  // Columns selector toolbar button text
  toolbarColumns: 'Колони',
  toolbarColumnsLabel: 'Покажи селектора на колони',
  // Filters toolbar button text
  toolbarFilters: 'Филтри',
  toolbarFiltersLabel: 'Покажи Филтрите',
  toolbarFiltersTooltipHide: 'Скрий Филтрите',
  toolbarFiltersTooltipShow: 'Покажи Филтрите',
  toolbarFiltersTooltipActive: count => `${count} активни филтри`,
  // Quick filter toolbar field
  // toolbarQuickFilterPlaceholder: 'Search…',
  // toolbarQuickFilterLabel: 'Search',
  // toolbarQuickFilterDeleteIconLabel: 'Clear',
  // Export selector toolbar button text
  toolbarExport: 'Изтегли',
  toolbarExportLabel: 'Изтегли',
  toolbarExportCSV: 'Изтегли като CSV',
  toolbarExportPrint: 'Принтиране',
  // toolbarExportExcel: 'Download as Excel',
  // Columns panel text
  columnsPanelTextFieldLabel: 'Намери колона',
  columnsPanelTextFieldPlaceholder: 'Заглавие на колона',
  columnsPanelDragIconLabel: 'Пренареди на колона',
  columnsPanelShowAllButton: 'Покажи Всички',
  columnsPanelHideAllButton: 'Скрий Всички',
  // Filter panel text
  filterPanelAddFilter: 'Добави Филтър',
  filterPanelDeleteIconLabel: 'Изтрий',
  // filterPanelLinkOperator: 'Logic operator',
  filterPanelOperators: 'Оператори',
  // TODO v6: rename to filterPanelOperator
  filterPanelOperatorAnd: 'И',
  filterPanelOperatorOr: 'Или',
  filterPanelColumns: 'Колони',
  filterPanelInputLabel: 'Стойност',
  filterPanelInputPlaceholder: 'Стойност на филтъра',
  // Filter operators text
  filterOperatorContains: 'съдържа',
  filterOperatorEquals: 'равно',
  filterOperatorStartsWith: 'започва с',
  filterOperatorEndsWith: 'завършва с',
  filterOperatorIs: 'е',
  filterOperatorNot: 'не е',
  filterOperatorAfter: 'е след',
  filterOperatorOnOrAfter: 'е на или след',
  filterOperatorBefore: 'е преди',
  filterOperatorOnOrBefore: 'е на или преди',
  filterOperatorIsEmpty: 'е празен',
  filterOperatorIsNotEmpty: 'не е празен',
  filterOperatorIsAnyOf: 'е някой от',
  // Filter values text
  filterValueAny: 'всякакви',
  filterValueTrue: 'вярно',
  filterValueFalse: 'невярно',
  // Column menu text
  columnMenuLabel: 'Меню',
  columnMenuShowColumns: 'Покажи колоните',
  columnMenuFilter: 'Филтри',
  columnMenuHideColumn: 'Скрий',
  columnMenuUnsort: 'Отмени сортирането',
  columnMenuSortAsc: 'Сортирай по възходящ ред',
  columnMenuSortDesc: 'Сортирай по низходящ ред',
  // Column header text
  columnHeaderFiltersTooltipActive: count => `${count} активни филтри`,
  columnHeaderFiltersLabel: 'Покажи Филтрите',
  columnHeaderSortIconLabel: 'Сортирай',
  // Rows selected footer text
  footerRowSelected: count => count !== 1 ? `${count.toLocaleString()} избрани редове` : `${count.toLocaleString()} избран ред`,
  // Total row amount footer text
  footerTotalRows: 'Общо Rедове:',
  // Total visible row amount footer text
  footerTotalVisibleRows: (visibleCount, totalCount) => `${visibleCount.toLocaleString()} от ${totalCount.toLocaleString()}`,
  // Checkbox selection text
  checkboxSelectionHeaderName: 'Избор на квадратче',
  checkboxSelectionSelectAllRows: 'Избери всички редове',
  checkboxSelectionUnselectAllRows: 'Отмени избора на всички редове',
  checkboxSelectionSelectRow: 'Избери ред',
  checkboxSelectionUnselectRow: 'Отмени избора на ред',
  // Boolean cell text
  booleanCellTrueLabel: 'да',
  booleanCellFalseLabel: 'не',
  // Actions cell more text
  actionsCellMore: 'още',
  // Column pinning text
  pinToLeft: 'Закачи в ляво',
  pinToRight: 'Закачи в дясно',
  unpin: 'Откачи',
  // Tree Data
  treeDataGroupingHeaderName: 'Група',
  treeDataExpand: 'виж деца',
  treeDataCollapse: 'скрий децата',
  // Grouping columns
  groupingColumnHeaderName: 'Група',
  groupColumn: name => `Групирай по ${name}`,
  unGroupColumn: name => `Спри групиране по ${name}`,
  // Master/detail
  // detailPanelToggle: 'Detail panel toggle',
  expandDetailPanel: 'Разгъване',
  collapseDetailPanel: 'Свиване' // Row reordering text
  // rowReorderingHeaderName: 'Row reordering',
  // Aggregation
  // aggregationMenuItemHeader: 'Aggregation',
  // aggregationFunctionLabelSum: 'sum',
  // aggregationFunctionLabelAvg: 'avg',
  // aggregationFunctionLabelMin: 'min',
  // aggregationFunctionLabelMax: 'max',
  // aggregationFunctionLabelSize: 'size',

};
const bgBG = (0, _getGridLocalization.getGridLocalization)(bgBGGrid, _locale.bgBG);
exports.bgBG = bgBG;