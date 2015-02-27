YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "BooleanFilterOptions",
        "DateTimeFilterOptions",
        "FilterOptions",
        "FloatingPointFilterOptions",
        "GuidFilterOptions",
        "IntegerFilterOptions",
        "NullFilterOptions",
        "QueryBuilder",
        "StringFilterOptions",
        "WhereFilterOptions"
    ],
    "modules": [
        "OData"
    ],
    "allModules": [
        {
            "displayName": "OData",
            "name": "OData",
            "description": "The OData module is designed to generate OData query strings for specific\nAPI endpoints. General usage is as follows.\n\n<pre>\nvar qb = new OData.QueryBuilder('/api/users');\nqb.addWhereFilter('id1', OData.STRING, 'fName', OData.EQUALS, 'Bartholomew');\nvar query = qb.generateQueryUrl(); // query would equal \"/api/users/?$filter=fName eq 'Bartholomew'\"\n</pre>\n\nThe OData object provides the following constants for use with `QueryBuilder.addWhereFilter()`.\n<br/>\nFilter types:\n- OData.NULL\n- OData.BOOLEAN\n- OData.DECIMAL\n- OData.SINGLE\n- OData.DOUBLE\n- OData.BYTE\n- OData.SBYTE\n- OData.INT16\n- OData.INT32\n- OData.INT64\n- OData.TIME\n- OData.DATE_TIME\n- OData.DATE_TIME_OFFSET\n- OData.GUID\n- OData.STRING\n\nQuery Operators:\n- OData.IS_TRUE\n- OData.IS_FALSE\n- OData.ROUND_EQUALS\n- OData.FLOOR_EQUALS\n- OData.CEILING_EQUALS\n- OData.EQUALS\n- OData.NOT_EQUALS\n- OData.GREATER_THAN\n- OData.GREATER_THAN_OR_EQUAL_TO\n- OData.LESS_THAN\n- OData.LESS_THAN_OR_EQUAL_TO\n- OData.BEFORE\n- OData.AFTER\n- OData.YEAR_EQUALS\n- OData.MONTH_NUMBER_EQUALS\n- OData.DAY_NUMBER_EQUALS\n- OData.HOUR_EQUALS\n- OData.MINUTE_EQUALS\n- OData.SECOND_EQUALS\n- OData.IN_SEMICOLON_SEPARATED\n- OData.CASE_INSENSITIVE_EQUALS\n- OData.CASE_INSENSITIVE_NOT_EQUALS\n- OData.STARTS_WITH\n- OData.DOES_NOT_START_WITH\n- OData.ENDS_WITH\n- OData.DOES_NOT_END_WITH\n- OData.CONTAINS\n- OData.HAS_LENGTH\n\nThe OData object provides the following constants for use with `QueryBuilder.setOrderBy()`.\n<br/>\nOrderBy Orders:\n- OData.NONE\n- OData.ASC\n- OData.DESC"
        }
    ]
} };
});