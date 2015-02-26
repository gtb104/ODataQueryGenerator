/**
 * The OData module is designed to generate OData query strings for specific
 * API endpoints. General usage is as follows.
 *
 * <pre>
 * var qb = new OData.QueryBuilder('/api/users');
 * qb.addWhereFilter('id1', OData.STRING, 'fName', OData.EQUALS, 'Bartholomew');
 * var query = qb.generateQueryUrl(); // query would equal "/api/users/?$filter=fName eq 'Bartholomew'"
 * </pre>
 *
 * The OData object provides the following constants for use with `QueryBuilder.addWhereFilter()`.
 * <br/>
 * Filter types:
 * - OData.NULL
 * - OData.BOOLEAN
 * - OData.DECIMAL
 * - OData.SINGLE
 * - OData.DOUBLE
 * - OData.BYTE
 * - OData.SBYTE
 * - OData.INT16
 * - OData.INT32
 * - OData.INT64
 * - OData.TIME
 * - OData.DATE_TIME
 * - OData.DATE_TIME_OFFSET
 * - OData.GUID
 * - OData.STRING
 *
 * Query Operators:
 * - OData.IS_TRUE
 * - OData.IS_FALSE
 * - OData.ROUND_EQUALS
 * - OData.FLOOR_EQUALS
 * - OData.CEILING_EQUALS
 * - OData.EQUALS
 * - OData.NOT_EQUALS
 * - OData.GREATER_THAN
 * - OData.GREATER_THAN_OR_EQUAL_TO
 * - OData.LESS_THAN
 * - OData.LESS_THAN_OR_EQUAL_TO
 * - OData.BEFORE
 * - OData.AFTER
 * - OData.YEAR_EQUALS
 * - OData.MONTH_NUMBER_EQUALS
 * - OData.DAY_NUMBER_EQUALS
 * - OData.HOUR_EQUALS
 * - OData.MINUTE_EQUALS
 * - OData.SECOND_EQUALS
 * - OData.IN_SEMICOLON_SEPARATED
 * - OData.CASE_INSENSITIVE_EQUALS
 * - OData.CASE_INSENSITIVE_NOT_EQUALS
 * - OData.STARTS_WITH
 * - OData.DOES_NOT_START_WITH
 * - OData.ENDS_WITH
 * - OData.DOES_NOT_END_WITH
 * - OData.CONTAINS
 * - OData.HAS_LENGTH
 *
 * The OData object provides the following constants for use with `QueryBuilder.setOrderBy()`.
 * <br/>
 * OrderBy Orders:
 * - OData.NONE
 * - OData.ASC
 * - OData.DESC
 *
 * @module OData
 */
 define(function() {
  var OData = {};

  // ----------------------------------------------------------------------------
  //    Constants
  // ----------------------------------------------------------------------------
  // Filter types
  OData.NULL = 'NULL';
  OData.BOOLEAN = 'BOOLEAN';
  OData.DECIMAL = 'DECIMAL';
  OData.SINGLE = 'SINGLE';
  OData.DOUBLE = 'DOUBLE';
  OData.BYTE = 'BYTE';
  OData.SBYTE = 'SBYTE';
  OData.INT16 = 'INT16';
  OData.INT32 = 'INT32';
  OData.INT64 = 'INT64';
  OData.TIME = 'TIME';
  OData.DATE_TIME = 'DATE_TIME';
  OData.DATE_TIME_OFFSET = 'DATE_TIME_OFFSET';
  OData.GUID = 'GUID';
  OData.STRING = 'STRING';
  // Query Operators
  OData.IS_TRUE = 'IS_TRUE';
  OData.IS_FALSE = 'IS_FALSE';
  OData.ROUND_EQUALS = 'ROUND_EQUALS';
  OData.FLOOR_EQUALS = 'FLOOR_EQUALS';
  OData.CEILING_EQUALS = 'CEILING_EQUALS';
  OData.EQUALS = 'EQUALS';
  OData.NOT_EQUALS = 'NOT_EQUALS';
  OData.GREATER_THAN = 'GREATER_THAN';
  OData.GREATER_THAN_OR_EQUAL_TO = 'GREATER_THAN_OR_EQUAL_TO';
  OData.LESS_THAN = 'LESS_THAN';
  OData.LESS_THAN_OR_EQUAL_TO = 'LESS_THAN_OR_EQUAL_TO';
  OData.BEFORE = 'BEFORE';
  OData.AFTER = 'AFTER';
  OData.YEAR_EQUALS = 'YEAR_EQUALS';
  OData.MONTH_NUMBER_EQUALS = 'MONTH_NUMBER_EQUALS';
  OData.DAY_NUMBER_EQUALS = 'DAY_NUMBER_EQUALS';
  OData.HOUR_EQUALS = 'HOUR_EQUALS';
  OData.MINUTE_EQUALS = 'MINUTE_EQUALS';
  OData.SECOND_EQUALS = 'SECOND_EQUALS';
  OData.IN_SEMICOLON_SEPARATED = 'IN_SEMICOLON_SEPARATED';
  OData.CASE_INSENSITIVE_EQUALS = 'CASE_INSENSITIVE_EQUALS';
  OData.CASE_INSENSITIVE_NOT_EQUALS = 'CASE_INSENSITIVE_NOT_EQUALS';
  OData.STARTS_WITH = 'STARTS_WITH';
  OData.DOES_NOT_START_WITH = 'DOES_NOT_START_WITH';
  OData.ENDS_WITH = 'ENDS_WITH';
  OData.DOES_NOT_END_WITH = 'DOES_NOT_END_WITH';
  OData.CONTAINS = 'CONTAINS';
  OData.HAS_LENGTH = 'HAS_LENGTH';
  // OrderBy Orders
  OData.NONE = 0;
  OData.ASC = 1;
  OData.DESC = 2;

  /**
   * Extend the built in String class with a format function.
   * @private
   * @method format
   */
  if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] !== 'undefined' ? args[number] : match;
      });
    };
  }

  /**
   * Gives the child object a copy of the parent object's prototype.
   * @private
   * @method _extend
   * @param base {Function} The base method whose prototype will be copied.
   * @param child {Function} The child method who will get a copy of the parent's prototype.
   * @return {Function} The augmented child method.
   */
  OData._extend = function(base, child) {
    child.prototype = new base();
    child.prototype.constructor = child;
    child.base = base.prototype;
    return child;
  };

  /**
   * Make sure there is a trailing /.
   * @private
   * @method _cleanEndpointUrl
   * @param url {String} The endpoint url.
   * @return {String} The cleaned endpoint url.
   */
  OData._cleanEndpointUrl = function(url) {
    if (url[url.length - 1] !== '/') {
      url += '/';
    }
    return url;
  };


  // ------------------------------------------------------------------------------
  // The filters used to make meaningful queries to the service.
  // ------------------------------------------------------------------------------
  /**
   * Where clause filter options base class.
   * @class FilterOptions
   * @constructor
   */
  OData.FilterOptions = function() {
    this.options = {
      encodeUrlComponents: false
    };
    this.values = [];
  };

  /**
   * Where clause filter base class init method.
   * @method init
   * @param options {Object} Options to set on each where filter.
   */
  OData.FilterOptions.prototype.init = function(options) {
    for (var name in options) {
      this.options[name] = options[name];
    }
  };

  /**
   * Base query string for each type of filter.
   * @method getWhereQuery
   * @param propNames {Array|String} The list of property names.
   * @param operator {String} The comparator for this filter.
   * @param value {Array|String} The value of the property.
   * @returns {String} The query string for the specified where filter.
   */
  OData.FilterOptions.prototype.getWhereQuery = function(propNames, operator, values) {
    var i,
        l,
        finalQuery = [],
        filter = this.values[operator],
        query = '';
    if (propNames && values !== undefined && values !== null) {
      if (Array.isArray(propNames) && Array.isArray(values)) {
        if (propNames.length > values.length) {
          // Too many properties, truncate to match values
          propNames.splice(values.length, propNames.length);
        }
        if (values.length > propNames.length) {
          // Too many values, truncate to match properties
          values.splice(propNames.length, values.length);
        }
        for(i=0, l=propNames.length; i < l; i++) {
          finalQuery.push(filter.stringFormat.format(propNames[i], values[i]));
        }
        query = finalQuery.join(' or ');
      } else if (Array.isArray(propNames) || Array.isArray(values)) {
        // Is propNames an array
        if (Array.isArray(propNames)) {
          // make all the props match the one value
          for(i=0, l=propNames.length; i < l; i++) {
           finalQuery.push(filter.stringFormat.format(propNames[i], values));
          }
        } else {
          // make all the values match the one propertyName
          for(i=0, l=values.length; i < l; i++) {
            finalQuery.push(filter.stringFormat.format(propNames, values[i]));
          }
        }
        query = finalQuery.join(' or ');
      } else {
        // We have only one property/value.
        query = filter.stringFormat.format(propNames, values);
      }
    }
    return query;
  };

  /**
   * Null where clause filter class.
   * @class NullFilterOptions
   * @extends FilterOptions
   * @param options {Object} The options object.
   */
  OData.NullFilterOptions = OData._extend(OData.FilterOptions, function(options) {
    this.init(options);
    this.values = [
      { errorMessage: 'You are not able to query on this property.' }
    ];
  });

  /**
   * Gets the where query, which for null is an empty string.
   * @method getWhereQuery
   * @return {String} An empty string.
   */
  OData.NullFilterOptions.prototype.getWhereQuery = function() {
    return '';
  };

  /**
   * Boolean where clause filter class.
   * @class BooleanFilterOptions
   * @extends FilterOptions
   * @param options {Object} The options object.
   */
  OData.BooleanFilterOptions = OData._extend(OData.FilterOptions, function(options) {
    this.init(options);
    this.values = {
      'IS_TRUE':  { stringFormat: '{0} eq true'  },
      'IS_FALSE': { stringFormat: '{0} eq false' }
    };
  });

  /**
   * Gets the where query for Boolean objects.
   * @method getWhereQuery
   * @param propNames {Array|String} The list of property names.
   * @param operator {String} The type of comparator to perform.
   * @return {String} A Boolean query string.
   */
  OData.BooleanFilterOptions.prototype.getWhereQuery = function(propNames, operator) {
    return OData.BooleanFilterOptions.base.getWhereQuery.call(
      this, propNames, operator, '');
  };

  /**
   * FloatingPoint where clause filter class.
   * @class FloatingPointFilterOptions
   * @extends FilterOptions
   * @param options {Object} The options object.
   */
  OData.FloatingPointFilterOptions = OData._extend(OData.FilterOptions, function(options) {
    this.init(options);
    this.values = {
      'ROUND_EQUALS':             { stringFormat: 'round({0}) eq {1}'   },
      'FLOOR_EQUALS':             { stringFormat: 'floor({0}) eq {1}'   },
      'CEILING_EQUALS':           { stringFormat: 'ceiling({0}) eq {1}' },
      'EQUALS':                   { stringFormat: '{0} eq {1}'          },
      'NOT_EQUALS':               { stringFormat: '{0} ne {1}'          },
      'GREATER_THAN':             { stringFormat: '{0} gt {1}'          },
      'GREATER_THAN_OR_EQUAL_TO': { stringFormat: '{0} ge {1}'          },
      'LESS_THAN':                { stringFormat: '{0} lt {1}'          },
      'LESS_THAN_OR_EQUAL_TO':    { stringFormat: '{0} le {1}'          }
    };
  });

  /**
   * Integer where clause filter class.
   * @class IntegerFilterOptions
   * @extends FilterOptions
   * @param options {Object} The options object.
   */
  OData.IntegerFilterOptions = OData._extend(OData.FilterOptions, function(options) {
    this.init(options);
    this.values = {
      'EQUALS':                   { stringFormat: '{0} eq {1}' },
      'NOT_EQUALS':               { stringFormat: '{0} ne {1}' },
      'GREATER_THAN':             { stringFormat: '{0} gt {1}' },
      'GREATER_THAN_OR_EQUAL_TO': { stringFormat: '{0} ge {1}' },
      'LESS_THAN':                { stringFormat: '{0} lt {1}' },
      'LESS_THAN_OR_EQUAL_TO':    { stringFormat: '{0} le {1}' }
    };
  });

  /**
   * Date and time where clause filter class.
   * @class DateTimeFilterOptions
   * @extends FilterOptions
   * @param options {Object} The options object.
   */
  OData.DateTimeFilterOptions = OData._extend(OData.FilterOptions, function(options) {
    this.init(options);
    this.values = {
      'BEFORE':              { stringFormat: "{0} le datetime'{1}'" },
      'AFTER':               { stringFormat: "{0} ge datetime'{1}'" },
      'YEAR_EQUALS':         { stringFormat: 'year({0}) eq {1}'     },
      'MONTH_NUMBER_EQUALS': { stringFormat: 'month({0}) eq {1}'    },
      'DAY_NUMBER_EQUALS':   { stringFormat: 'day({0}) eq {1}'      },
      'HOUR_EQUALS':         { stringFormat: 'hour({0}) eq {1}'     },
      'MINUTE_EQUALS':       { stringFormat: 'minute({0}) eq {1}'   },
      'SECOND_EQUALS':       { stringFormat: 'second({0}) eq {1}'   }
    };
  });

  /**
   * Gets the where query for DateTime objects.
   * @method getWhereQuery
   * @param propNames {Array|String} The list of property names.
   * @param operator {Array} The type of comparator to perform.
   * @param values {Array|String} The value of the property.
   * @return {String} A DateTime query string.
   */
  OData.DateTimeFilterOptions.prototype.getWhereQuery = function(propNames, operator, values) {
    var query = '',
        val,
        date,
        i,
        validDate = function(value) {
          return (Object.prototype.toString.call(value) === '[object Date]') ? true : false;
        };
    // Take values and convert to ISO string dates
    if (Array.isArray(values)) {
      i = values.length - 1;
      while (i >= 0) {
        val = values[i];
        if (validDate(val)) {
          values[i] = val.toISOString();
        } else {
          date = new Date(val);
          if (validDate(date)) {
            values[i] = date.toISOString();
          } else {
            // Remove the value as it wasn't able to convert to a date
            console.error('OData.DateTimeFilterOptions.getWhereQuery(): Could not convert ' +
              val.toString() +
              ' to a date. Removing from query');
            values.splice(i,1);
          }
        }
        i--;
      }
    } else {
      if (validDate(values)) {
        values = new Date(values).toISOString();
      } else {
        date = new Date(values);
        if (validDate(date)) {
          values = date.toISOString();
        } else {
          // Dropout because `values` wasn't able to convert to a date
          console.error('OData.DateTimeFilterOptions.getWhereQuery(): Could not convert ' +
            values.toString() + ' to a date. Query was not generated.');
          return;
        }
      }
    }
    query = OData.DateTimeFilterOptions.base.getWhereQuery.call(
      this, propNames, operator, values);
      return query;
  };

  /**
   * GUID where clause filter class.
   * @class GuidFilterOptions
   * @extends FilterOptions
   * @param options {Object} The options object.
   */
  OData.GuidFilterOptions = OData._extend(OData.FilterOptions, function(options) {
    this.init(options);
    this.values = {
      'EQUALS':     { stringFormat: "{0} eq guid'{1}'" },
      'NOT_EQUALS': { stringFormat: "{0} ne guid'{1}'" }
    };
  });

  /**
   * String where clause filter class.
   * @class StringFilterOptions
   * @extends FilterOptions
   * @param options {Object} The options object.
   */
  OData.StringFilterOptions = OData._extend(OData.FilterOptions, function(options) {
    this.init(options);
    this.values = {
      'EQUALS':                      { stringFormat: "{0} eq '{1}'"                    },
      'NOT_EQUALS':                  { stringFormat: "{0} ne '{1}'"                    },
      'IN_SEMICOLON_SEPARATED':      { stringFormat: "{0} eq '{1}'"                    },
      'CASE_INSENSITIVE_EQUALS':     { stringFormat: "tolower({0}) eq tolower('{1}')"  },
      'CASE_INSENSITIVE_NOT_EQUALS': { stringFormat: "tolower({0}) eq tolower('{1}')"  },
      'STARTS_WITH':                 { stringFormat: "startswith({0}, '{1}') eq true"  },
      'DOES_NOT_START_WITH':         { stringFormat: "startswith({0}, '{1}') eq false" },
      'ENDS_WITH':                   { stringFormat: "endswith({0}, '{1}') eq true"    },
      'DOES_NOT_END_WITH':           { stringFormat: "endswith({0}, '{1}') eq false"   },
      'CONTAINS':                    { stringFormat: "substringof('{1}', {0}) eq true" },
      'HAS_LENGTH':                  { stringFormat: "length({0}) eq {1}"              }
    };
  });

  /**
   * Gets the where query for String objects.
   * @method getWhereQuery
   * @param propNames {Array|String} The list of property names.
   * @param operator {String} The type of comparator to perform.
   * @param values {Array|String} The value of the property.
   * @return {String} A String query string.
   */
  OData.StringFilterOptions.prototype.getWhereQuery = function(propNames, operator, values) {
    var query = '',
        i,
        l,
        segments,
        finalValue;
    // Perform some sanitization
    if (Array.isArray(values)) {
      for (i=0, l=values.length; i < l; i++) {
        values[i] = String(values[i]).replace(new RegExp("'", 'g'), "''");
        if (this.options.encodeUrlComponents) {
          values[i] = encodeURIComponent(values[i]);
        }
      }
    } else {
      values = String(values).replace(new RegExp("'", 'g'), "''");
      if (this.options.encodeUrlComponents) {
        values = encodeURIComponent(values);
      }
    }
    if (operator === OData.IN_SEMICOLON_SEPARATED) {
      segments = values.split(';');
      finalValue = [];
      for (i=0, l=segments.length; i < l; i++) {
        finalValue.push(OData.StringFilterOptions.base.getWhereQuery.call(
          this, propNames, operator, segments[i].trim()));
      }
      query = finalValue.join(' or ');
    } else {
      query = OData.StringFilterOptions.base.getWhereQuery.call(
        this, propNames, operator, values);
    }
    return query;
  };

  /**
   * Where clause filter class.
   * @class WhereFilterOptions
   * @param options {Object} The options object.
   */
  OData.WhereFilterOptions = function(options) {
    this.NULL = new OData.NullFilterOptions(options);
    this.BOOLEAN = new OData.BooleanFilterOptions(options);
    this.DECIMAL =
        this.SINGLE =
        this.DOUBLE = new OData.FloatingPointFilterOptions(options);
    this.BYTE =
        this.SBYTE =
        this.INT16 =
        this.INT32 =
        this.INT64 = new OData.IntegerFilterOptions(options);
    this.TIME =
        this.DATE_TIME =
        this.DATE_TIME_OFFSET = new OData.DateTimeFilterOptions(options);
    this.GUID = new OData.GuidFilterOptions(options);
    this.STRING = new OData.StringFilterOptions(options);
  };

  /**
   * Where clause filter class.
   * @method getFilterHandler
   * @param type {String} Type of filter to retrieve.
   * @return {Object} A filter object.
   */
  OData.WhereFilterOptions.prototype.getFilterHandler = function(type) {
    if (this[type]) {
      return this[type];
    } else {
      return this.Null;
    }
  };

  // -----------------------------------------------------------------------------------
  // The query builder class, which knows everything about entities, properties, etc.
  // -----------------------------------------------------------------------------------

  /**
   * Query builder class.
   * @class QueryBuilder
   * @param urlEndpoint {String} The URL of the service endpoint.
   * @param options {Object} The options object.
   */
  OData.QueryBuilder = function(urlEndpoint, options) {
    if (!urlEndpoint) {
      throw 'You must specify the OData service endpoint URL. This should be everything up to the "?"';
    }
    this.options = options || {};
    this.baseUrl = OData._cleanEndpointUrl(urlEndpoint);
    this.top = null;
    this.skip = null;
    this.whereFilters = [];
    this.orderBy = [];
    this.filterOptions = new OData.WhereFilterOptions(this.options);
  };

  /**
   * Set the $top value in the final query. If you set val to null,
   * $top will be removed from the final query string.
   * @method setTop
   * @param val {Number} The top value.
   */
  OData.QueryBuilder.prototype.setTop = function(val) {
    this.top = isNaN(parseInt(val)) ? null : parseInt(val);
  };

  /**
   * Set the $skip value in the final query. If you set val to null,
   * $skip will be removed from the final query string.
   * @method setSkip
   * @param val {Number} The skip value.
   */
  OData.QueryBuilder.prototype.setSkip = function(val) {
    this.skip = isNaN(parseInt(val)) ? null : parseInt(val);
  };

  /**
   * Set the $orderby value in the final query. You need to pass the
   * name of the property you want to sort by, and the order of the
   * sort. Valid values are 0, 1, or 2 (NONE, ASC, and DESC respectively).
   * If you pass null, $orderby will be removed from the final query string.
   * @method setOrderBy
   * @param propName {String} The property to order by.
   * @param val {Number} The sort order.
   */
  OData.QueryBuilder.prototype.setOrderBy = function(propName, val) {
    if (propName && val && (val === 0 || val === 1 || val === 2)) {
      this.orderBy.push({
        propName: propName,
        value: val
      });
    } else {
      this.orderBy.length = 0;
      console.warn('OData.QueryBuilder::setOrderBy(): Missing property name or invalid sort order. $orderBy will be ignored.');
    }
  };

  /**
   * Return the base endpoint url.
   * @method getBaseUrl
   * @return {String} The base endpoint url.
   */
  OData.QueryBuilder.prototype.getBaseUrl = function() {
    return this.baseUrl;
  };

  /**
   * Return the final OData query URL.
   * @method generateQueryUrl
   * @return {String} A fully qualified query URL.
   */
  OData.QueryBuilder.prototype.generateQueryUrl = function() {
    var url = this.getBaseUrl(),
        i,
        propertyId,
        propertyName,
        value,
        queryFiltersString,
        sortingOptions = [],
        lastUrlCharIndex;
    url += '?';
    if (this.skip !== undefined && this.skip !== null) {
      url += '$skip=' + this.skip + '&';
    }
    if (this.top !== undefined && this.top !== null) {
      url += '$top=' + this.top + '&';
    }
    if (this.whereFilters && this.whereFilters.length > 0) {
    //   queryFiltersString = this._getWhereQueryFilter(this.whereFilters);
    //   if (queryFiltersString === undefined) {
    //     throw 'Invalid query filters ' + JSON.stringify(this.whereFilters);
    //   }
      url += '$filter=' + this.generateQueryFilterUrl() + '&';
    }
    if (this.orderBy && this.orderBy.length > 0) {
      url += '$orderby=';
      for (i in this.orderBy) {
        value = this.orderBy[i].value; //0, 1, or 2
        propertyName = this.orderBy[i].propName;
        if (propertyName) {
          switch (value) {
            case 0: {
              // Do not order by this propertyId.
              break;
            }
            case 1: {
              // Sort in asc order.
              sortingOptions.push(propertyName);
              break;
            }
            case 2: {
              // Sort in desc order.
              sortingOptions.push(propertyName + ' desc');
              break;
            }
          }
        }
      }
      // Separate the elements with a comma ',' and add the '&' at the end.
      url += sortingOptions.join() + '&';
    }
    // Remove the & at the end.
    lastUrlCharIndex = url.length - 1;
    if (url[lastUrlCharIndex] === '&') {
      url = url.substring(0, lastUrlCharIndex);
    }
    return url;
  };

  /**
   * Return the filter portion of the OData query URL.
   * @method generateQueryFilterUrl
   * @return {String} The filter URL.
   */
  OData.QueryBuilder.prototype.generateQueryFilterUrl = function() {
    var ret = '';
    if (this.whereFilters && this.whereFilters.length > 0) {
      var queryFiltersString = this._getWhereQueryFilter(this.whereFilters);
      if (queryFiltersString === undefined) {
        throw 'Invalid query filters ' + JSON.stringify(this.whereFilters);
      }
      ret = queryFiltersString;
    }
    return ret;
  };


  /**
   * Clear the filter list for the OData final query url.
   * @method removeAllWhereFilters
   */
  OData.QueryBuilder.prototype.removeAllWhereFilters = function() {
    this.whereFilters = [];
  };

  /**
   * Add a filter to the list of filter that are used to build a query string.
   * If you call this method multiple times, each filter is AND'ed together.
   * If propNames or propValues is an array of values, the resulting query
   * string is OR'ed together for that specific filter.
   * @method addWhereFilter
   * @example
   *    addWhereFilter(OData.STRING, 'FNAME', OData.EQUALS, 'bob')
   *    addWhereFilter(OData.STRING, 'LNAME', OData.EQUALS, 'smith')
   * getODataQueryUrl() would return "/api/user/?$filter=FNAME eq 'bob' and LNAME eq 'smith'"
   * @example
   *    addWhereFilter(OData.STRING, ['FNAME','LNAME'], OData.EQUALS, ['bob','smith'])
   * getODataQueryUrl() would return "/api/user/?$filter=FNAME eq 'bob' or LNAME eq 'smith'"
   * @example
   *    addWhereFilter(OData.STRING, ['FNAME','LNAME'], OData.EQUALS, 'bob')
   * getODataQueryUrl() would return "/api/user/?$filter=FNAME eq 'bob' or LNAME eq 'bob'"
   * @example
   *    addWhereFilter(OData.STRING, 'FNAME', OData.EQUALS, ['bob','sam'])
   * getODataQueryUrl() would return "/api/user/?$filter=FNAME eq 'bob' or FNAME eq 'sam'"
   * @param id {String} Unique id for a filter.
   * @param filterType {String} The property filter name(STRING, TIME, DECIMAL, etc).
   * @param propNames {Array|String} A list of property names.
   * @param filterOperator {String} The type of filter(EQUALS, CONTAINS, etc).
   * @param propValues {Array|String} The value for the filter.
   */
  OData.QueryBuilder.prototype.addWhereFilter = function(id, filterType, propNames, filterOperator, propValues) {
    var filter = {
      id: id,
      filterType: filterType,
      propNames: propNames,
      filterOperator: filterOperator,
      propValues: propValues
    };
    // Check if element already exist.
    for (var i = this.whereFilters.length - 1; i >= 0; i--) {
      if (this.whereFilters[i].id === id) {
        // Update.
        this.whereFilters[i] = filter;
        return;
      }
    }
    // Element not found: add a new one.
    this.whereFilters.push(filter);
  };

  /**
   * Delete a specific filter in the filter list.
   * @method removeWhereFilter
   * @param id {String} The id of the filter to remove.
   */
  OData.QueryBuilder.prototype.removeWhereFilter = function(id) {
    for (var i = this.whereFilters.length - 1; i >= 0; i--) {
      // Only doing double equals here because the id could be of type string or number.
      if (this.whereFilters[i].id == id) {
        this.whereFilters.splice(i, 1);
        break;
      }
    }
  };

  /**
   * Return the where filters formatted for the final OData query url.
   * @private
   * @method _getWhereQueryFilter
   * @param whereFilters {Array} A list of all the query filters.
   * @return {Array} The where filters formatted for the final OData query url.
   */
  OData.QueryBuilder.prototype._getWhereQueryFilter = function(whereFilters) {
    var i,
        l,
        filter,
        result = '';
    for (i = 0, l = whereFilters.length; i < l; i++) {
      filter = whereFilters[i];
      result += this.filterOptions.getFilterHandler(filter.filterType).getWhereQuery(
        filter.propNames, filter.filterOperator, filter.propValues);
      if (i < l - 1) {
        result += ' and ';
      }
    }
    return result;
  };

  return OData;
});
