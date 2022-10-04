import _extends from "@babel/runtime/helpers/esm/extends";
import { GridLinkOperator } from '../../../models';
import { getDefaultGridFilterModel } from './gridFilterState';
import { buildWarning } from '../../../utils/warning';
import { gridColumnFieldsSelector, gridColumnLookupSelector } from '../columns';

/**
 * Adds default values to the optional fields of a filter items.
 * @param {GridFilterItem} item The raw filter item.
 * @param {React.MutableRefObject<GridApiCommunity>} apiRef The API of the grid.
 * @return {GridFilterItem} The clean filter item with an uniq ID and an always-defined operatorValue.
 * TODO: Make the typing reflect the different between GridFilterInputItem and GridFilterItem.
 */
export const cleanFilterItem = (item, apiRef) => {
  const cleanItem = _extends({}, item);

  if (cleanItem.id == null) {
    cleanItem.id = Math.round(Math.random() * 1e5);
  }

  if (cleanItem.operatorValue == null) {
    // Selects a default operator
    // We don't use `apiRef.current.getColumn` because it is not ready during state initialization
    const column = gridColumnLookupSelector(apiRef)[cleanItem.columnField];
    cleanItem.operatorValue = column && column.filterOperators[0].value;
  }

  return cleanItem;
};
const filterModelDisableMultiColumnsFilteringWarning = buildWarning(['MUI: The `filterModel` can only contain a single item when the `disableMultipleColumnsFiltering` prop is set to `true`.', 'If you are using the community version of the `DataGrid`, this prop is always `true`.'], 'error');
const filterModelMissingItemIdWarning = buildWarning("MUI: The 'id' field is required on `filterModel.items` when you use multiple filters.", 'error');
const filterModelMissingItemOperatorWarning = buildWarning(['MUI: One of your filtering item have no `operatorValue` provided.', 'This property will become required on `@mui/x-data-grid@6.X`.']);
export const sanitizeFilterModel = (model, disableMultipleColumnsFiltering, apiRef) => {
  const hasSeveralItems = model.items.length > 1;
  let items;

  if (hasSeveralItems && disableMultipleColumnsFiltering) {
    filterModelDisableMultiColumnsFilteringWarning();
    items = [model.items[0]];
  } else {
    items = model.items;
  }

  const hasItemsWithoutIds = hasSeveralItems && items.some(item => item.id == null);
  const hasItemWithoutOperator = items.some(item => item.operatorValue == null);

  if (hasItemsWithoutIds) {
    filterModelMissingItemIdWarning();
  }

  if (hasItemWithoutOperator) {
    filterModelMissingItemOperatorWarning();
  }

  if (hasItemWithoutOperator || hasItemsWithoutIds) {
    return _extends({}, model, {
      items: items.map(item => cleanFilterItem(item, apiRef))
    });
  }

  if (model.items !== items) {
    return _extends({}, model, {
      items
    });
  }

  return model;
};
export const mergeStateWithFilterModel = (filterModel, disableMultipleColumnsFiltering, apiRef) => filteringState => _extends({}, filteringState, {
  filterModel: sanitizeFilterModel(filterModel, disableMultipleColumnsFiltering, apiRef)
});

const getFilterCallbackFromItem = (filterItem, apiRef) => {
  if (!filterItem.columnField || !filterItem.operatorValue) {
    return null;
  }

  const column = apiRef.current.getColumn(filterItem.columnField);

  if (!column) {
    return null;
  }

  let parsedValue;

  if (column.valueParser) {
    var _filterItem$value;

    const parser = column.valueParser;
    parsedValue = Array.isArray(filterItem.value) ? (_filterItem$value = filterItem.value) == null ? void 0 : _filterItem$value.map(x => parser(x)) : parser(filterItem.value);
  } else {
    parsedValue = filterItem.value;
  }

  const newFilterItem = _extends({}, filterItem, {
    value: parsedValue
  });

  const filterOperators = column.filterOperators;

  if (!(filterOperators != null && filterOperators.length)) {
    throw new Error(`MUI: No filter operators found for column '${column.field}'.`);
  }

  const filterOperator = filterOperators.find(operator => operator.value === newFilterItem.operatorValue);

  if (!filterOperator) {
    throw new Error(`MUI: No filter operator found for column '${column.field}' and operator value '${newFilterItem.operatorValue}'.`);
  }

  const applyFilterOnRow = filterOperator.getApplyFilterFn(newFilterItem, column);

  if (typeof applyFilterOnRow !== 'function') {
    return null;
  }

  const fn = rowId => {
    const cellParams = apiRef.current.getCellParams(rowId, newFilterItem.columnField);
    return applyFilterOnRow(cellParams);
  };

  return {
    fn,
    item: newFilterItem
  };
};
/**
 * Generates a method to easily check if a row is matching the current filter model.
 * @param {GridFilterModel} filterModel The model with which we want to filter the rows.
 * @param {React.MutableRefObject<GridApiCommunity>} apiRef The API of the grid.
 * @returns {GridAggregatedFilterItemApplier | null} A method that checks if a row is matching the current filter model. If `null`, we consider that all the rows are matching the filters.
 */


export const buildAggregatedFilterItemsApplier = (filterModel, apiRef) => {
  const {
    items
  } = filterModel;
  const appliers = items.map(item => getFilterCallbackFromItem(item, apiRef)).filter(callback => !!callback);

  if (appliers.length === 0) {
    return null;
  }

  return (rowId, shouldApplyFilter) => {
    const resultPerItemId = {};
    const filteredAppliers = shouldApplyFilter ? appliers.filter(applier => shouldApplyFilter(applier.item.columnField)) : appliers;
    filteredAppliers.forEach(applier => {
      resultPerItemId[applier.item.id] = applier.fn(rowId);
    });
    return resultPerItemId;
  };
};
/**
 * Generates a method to easily check if a row is matching the current quick filter.
 * @param {any[]} values The model with which we want to filter the rows.
 * @param {React.MutableRefObject<GridApiCommunity>} apiRef The API of the grid.
 * @returns {GridAggregatedFilterItemApplier | null} A method that checks if a row is matching the current filter model. If `null`, we consider that all the rows are matching the filters.
 */

export const buildAggregatedQuickFilterApplier = (filterModel, apiRef) => {
  const {
    quickFilterValues = []
  } = filterModel;

  if (quickFilterValues.length === 0) {
    return null;
  }

  const columnsFields = gridColumnFieldsSelector(apiRef);
  const appliersPerColumnField = {};
  columnsFields.forEach(field => {
    const column = apiRef.current.getColumn(field);
    const getApplyQuickFilterFn = column == null ? void 0 : column.getApplyQuickFilterFn;

    if (!getApplyQuickFilterFn) {
      return;
    }

    appliersPerColumnField[field] = quickFilterValues.map(value => getApplyQuickFilterFn(value, column, apiRef));
  }); // If some value does not have an applier we ignore them

  const sanitizedQuickFilterValues = quickFilterValues.filter((value, index) => Object.keys(appliersPerColumnField).some(field => appliersPerColumnField[field][index] != null));

  if (sanitizedQuickFilterValues.length === 0) {
    return null;
  }

  return (rowId, shouldApplyFilter) => {
    const usedCellParams = {};
    const columnsFieldsToFilter = [];
    Object.keys(appliersPerColumnField).forEach(columnField => {
      if (!shouldApplyFilter || shouldApplyFilter(columnField)) {
        usedCellParams[columnField] = apiRef.current.getCellParams(rowId, columnField);
        columnsFieldsToFilter.push(columnField);
      }
    });
    const quickFilterValueResult = {};
    sanitizedQuickFilterValues.forEach((value, index) => {
      const isPassing = columnsFieldsToFilter.some(field => {
        var _appliersPerColumnFie, _appliersPerColumnFie2;

        if (appliersPerColumnField[field][index] == null) {
          return false;
        }

        return (_appliersPerColumnFie = (_appliersPerColumnFie2 = appliersPerColumnField[field])[index]) == null ? void 0 : _appliersPerColumnFie.call(_appliersPerColumnFie2, usedCellParams[field]);
      });
      quickFilterValueResult[value] = isPassing;
    });
    return quickFilterValueResult;
  };
};
export const buildAggregatedFilterApplier = (filterModel, apiRef) => {
  const isRowMatchingFilterItems = buildAggregatedFilterItemsApplier(filterModel, apiRef);
  const isRowMatchingQuickFilter = buildAggregatedQuickFilterApplier(filterModel, apiRef);
  return (rowId, shouldApplyFilter) => ({
    passingFilterItems: isRowMatchingFilterItems && isRowMatchingFilterItems(rowId, shouldApplyFilter),
    passingQuickFilterValues: isRowMatchingQuickFilter && isRowMatchingQuickFilter(rowId, shouldApplyFilter)
  });
};
export const passFilterLogic = (allFilterItemResults, allQuickFilterResults, filterModel, apiRef) => {
  var _filterModel$quickFil, _filterModel$linkOper;

  const cleanedFilterItems = filterModel.items.filter(item => getFilterCallbackFromItem(item, apiRef) !== null);
  const cleanedAllFilterItemResults = allFilterItemResults.filter(result => result != null);
  const cleanedAllQuickFilterResults = allQuickFilterResults.filter(result => result != null); // Defaultize operators

  const quickFilterLogicOperator = (_filterModel$quickFil = filterModel.quickFilterLogicOperator) != null ? _filterModel$quickFil : getDefaultGridFilterModel().quickFilterLogicOperator;
  const linkOperator = (_filterModel$linkOper = filterModel.linkOperator) != null ? _filterModel$linkOper : getDefaultGridFilterModel().linkOperator; // get result for filter items model

  if (cleanedAllFilterItemResults.length > 0) {
    // Return true if the item pass with one of the rows
    const filterItemPredicate = item => {
      return cleanedAllFilterItemResults.some(filterItemResult => filterItemResult[item.id]);
    };

    if (linkOperator === GridLinkOperator.And) {
      const passesAllFilters = cleanedFilterItems.every(filterItemPredicate);

      if (!passesAllFilters) {
        return false;
      }
    } else {
      const passesSomeFilters = cleanedFilterItems.some(filterItemPredicate);

      if (!passesSomeFilters) {
        return false;
      }
    }
  } // get result for quick filter model


  if (cleanedAllQuickFilterResults.length > 0 && filterModel.quickFilterValues != null) {
    // Return true if the item pass with one of the rows
    const quickFilterValuePredicate = value => {
      return cleanedAllQuickFilterResults.some(quickFilterValueResult => quickFilterValueResult[value]);
    };

    if (quickFilterLogicOperator === GridLinkOperator.And) {
      const passesAllQuickFilterValues = filterModel.quickFilterValues.every(quickFilterValuePredicate);

      if (!passesAllQuickFilterValues) {
        return false;
      }
    } else {
      const passesSomeQuickFilterValues = filterModel.quickFilterValues.some(quickFilterValuePredicate);

      if (!passesSomeQuickFilterValues) {
        return false;
      }
    }
  }

  return true;
};