package com.ecommerce.common.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class QueryOptimizationService {
    
    private static final Logger logger = LoggerFactory.getLogger(QueryOptimizationService.class);
    
    @Autowired
    private EntityManager entityManager;
    
    /**
     * Analyze query performance and provide optimization suggestions
     */
    public QueryAnalysisResult analyzeQuery(String queryString, Map<String, Object> parameters) {
        QueryAnalysisResult result = new QueryAnalysisResult();
        result.setOriginalQuery(queryString);
        
        try {
            // Execute EXPLAIN on the query to analyze performance
            String explainQuery = "EXPLAIN " + queryString;
            Query query = entityManager.createNativeQuery(explainQuery);
            
            // Set parameters if provided
            if (parameters != null) {
                parameters.forEach(query::setParameter);
            }
            
            @SuppressWarnings("unchecked")
            List<Object[]> explainResults = query.getResultList();
            result.setExplainResults(explainResults);
            
            // Analyze the explain results and provide suggestions
            analyzePlan(explainResults, result);
            
        } catch (Exception e) {
            logger.error("Error analyzing query: {}", queryString, e);
            result.addSuggestion("Query analysis failed: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Get database statistics for performance monitoring
     */
    public DatabaseStatistics getDatabaseStatistics() {
        DatabaseStatistics stats = new DatabaseStatistics();
        
        try {
            // Get connection statistics
            Query connectionQuery = entityManager.createNativeQuery(
                "SHOW STATUS WHERE Variable_name IN ('Threads_connected', 'Threads_running', 'Max_used_connections')"
            );
            @SuppressWarnings("unchecked")
            List<Object[]> connectionResults = connectionQuery.getResultList();
            
            for (Object[] row : connectionResults) {
                String variable = (String) row[0];
                String value = (String) row[1];
                
                switch (variable) {
                    case "Threads_connected":
                        stats.setActiveConnections(Integer.parseInt(value));
                        break;
                    case "Threads_running":
                        stats.setRunningQueries(Integer.parseInt(value));
                        break;
                    case "Max_used_connections":
                        stats.setMaxUsedConnections(Integer.parseInt(value));
                        break;
                }
            }
            
            // Get query cache statistics
            Query cacheQuery = entityManager.createNativeQuery(
                "SHOW STATUS WHERE Variable_name LIKE 'Qcache%'"
            );
            @SuppressWarnings("unchecked")
            List<Object[]> cacheResults = cacheQuery.getResultList();
            
            Map<String, String> cacheStats = new HashMap<>();
            for (Object[] row : cacheResults) {
                cacheStats.put((String) row[0], (String) row[1]);
            }
            stats.setQueryCacheStats(cacheStats);
            
            // Get slow query statistics
            Query slowQuery = entityManager.createNativeQuery(
                "SHOW STATUS WHERE Variable_name IN ('Slow_queries', 'Questions')"
            );
            @SuppressWarnings("unchecked")
            List<Object[]> slowResults = slowQuery.getResultList();
            
            for (Object[] row : slowResults) {
                String variable = (String) row[0];
                String value = (String) row[1];
                
                if ("Slow_queries".equals(variable)) {
                    stats.setSlowQueries(Long.parseLong(value));
                } else if ("Questions".equals(variable)) {
                    stats.setTotalQueries(Long.parseLong(value));
                }
            }
            
        } catch (Exception e) {
            logger.error("Error getting database statistics", e);
        }
        
        return stats;
    }
    
    /**
     * Get table statistics for optimization
     */
    public List<TableStatistics> getTableStatistics(String databaseName) {
        try {
            Query query = entityManager.createNativeQuery(
                "SELECT TABLE_NAME, TABLE_ROWS, DATA_LENGTH, INDEX_LENGTH, " +
                "DATA_FREE, AUTO_INCREMENT, CREATE_TIME, UPDATE_TIME " +
                "FROM information_schema.TABLES " +
                "WHERE TABLE_SCHEMA = :databaseName " +
                "AND TABLE_TYPE = 'BASE TABLE' " +
                "ORDER BY DATA_LENGTH DESC"
            );
            query.setParameter("databaseName", databaseName);
            
            @SuppressWarnings("unchecked")
            List<Object[]> results = query.getResultList();
            
            return results.stream()
                .map(row -> new TableStatistics(
                    (String) row[0],  // TABLE_NAME
                    ((Number) row[1]).longValue(),  // TABLE_ROWS
                    ((Number) row[2]).longValue(),  // DATA_LENGTH
                    ((Number) row[3]).longValue(),  // INDEX_LENGTH
                    ((Number) row[4]).longValue(),  // DATA_FREE
                    row[5] != null ? ((Number) row[5]).longValue() : null,  // AUTO_INCREMENT
                    (java.sql.Timestamp) row[6],  // CREATE_TIME
                    (java.sql.Timestamp) row[7]   // UPDATE_TIME
                ))
                .collect(java.util.stream.Collectors.toList());
                
        } catch (Exception e) {
            logger.error("Error getting table statistics for database: {}", databaseName, e);
            return java.util.Collections.emptyList();
        }
    }
    
    /**
     * Optimize table by running ANALYZE TABLE
     */
    public void optimizeTable(String tableName) {
        try {
            Query query = entityManager.createNativeQuery("ANALYZE TABLE " + tableName);
            query.executeUpdate();
            logger.info("Optimized table: {}", tableName);
        } catch (Exception e) {
            logger.error("Error optimizing table: {}", tableName, e);
        }
    }
    
    /**
     * Get index usage statistics
     */
    public List<IndexStatistics> getIndexStatistics(String databaseName) {
        try {
            Query query = entityManager.createNativeQuery(
                "SELECT s.TABLE_NAME, s.INDEX_NAME, s.COLUMN_NAME, s.SEQ_IN_INDEX, " +
                "s.CARDINALITY, s.SUB_PART, s.NULLABLE, s.INDEX_TYPE " +
                "FROM information_schema.STATISTICS s " +
                "WHERE s.TABLE_SCHEMA = :databaseName " +
                "ORDER BY s.TABLE_NAME, s.INDEX_NAME, s.SEQ_IN_INDEX"
            );
            query.setParameter("databaseName", databaseName);
            
            @SuppressWarnings("unchecked")
            List<Object[]> results = query.getResultList();
            
            return results.stream()
                .map(row -> new IndexStatistics(
                    (String) row[0],  // TABLE_NAME
                    (String) row[1],  // INDEX_NAME
                    (String) row[2],  // COLUMN_NAME
                    ((Number) row[3]).intValue(),  // SEQ_IN_INDEX
                    row[4] != null ? ((Number) row[4]).longValue() : null,  // CARDINALITY
                    row[5] != null ? ((Number) row[5]).intValue() : null,  // SUB_PART
                    (String) row[6],  // NULLABLE
                    (String) row[7]   // INDEX_TYPE
                ))
                .collect(java.util.stream.Collectors.toList());
                
        } catch (Exception e) {
            logger.error("Error getting index statistics for database: {}", databaseName, e);
            return java.util.Collections.emptyList();
        }
    }
    
    private void analyzePlan(List<Object[]> explainResults, QueryAnalysisResult result) {
        for (Object[] row : explainResults) {
            // Analyze explain plan results and provide suggestions
            // This is a simplified analysis - in production, you'd want more sophisticated analysis
            
            if (row.length > 4) {
                String type = (String) row[3]; // type column
                String extra = row.length > 5 ? (String) row[5] : null; // extra column
                
                if ("ALL".equals(type)) {
                    result.addSuggestion("Full table scan detected - consider adding indexes");
                }
                
                if (extra != null && extra.contains("Using filesort")) {
                    result.addSuggestion("Filesort detected - consider adding index for ORDER BY clause");
                }
                
                if (extra != null && extra.contains("Using temporary")) {
                    result.addSuggestion("Temporary table created - consider query optimization");
                }
            }
        }
        
        if (result.getSuggestions().isEmpty()) {
            result.addSuggestion("Query appears to be well optimized");
        }
    }
    
    // Inner classes for result objects
    public static class QueryAnalysisResult {
        private String originalQuery;
        private List<Object[]> explainResults;
        private List<String> suggestions = new java.util.ArrayList<>();
        
        // Getters and setters
        public String getOriginalQuery() { return originalQuery; }
        public void setOriginalQuery(String originalQuery) { this.originalQuery = originalQuery; }
        
        public List<Object[]> getExplainResults() { return explainResults; }
        public void setExplainResults(List<Object[]> explainResults) { this.explainResults = explainResults; }
        
        public List<String> getSuggestions() { return suggestions; }
        public void addSuggestion(String suggestion) { this.suggestions.add(suggestion); }
    }
    
    public static class DatabaseStatistics {
        private int activeConnections;
        private int runningQueries;
        private int maxUsedConnections;
        private long slowQueries;
        private long totalQueries;
        private Map<String, String> queryCacheStats = new HashMap<>();
        
        // Getters and setters
        public int getActiveConnections() { return activeConnections; }
        public void setActiveConnections(int activeConnections) { this.activeConnections = activeConnections; }
        
        public int getRunningQueries() { return runningQueries; }
        public void setRunningQueries(int runningQueries) { this.runningQueries = runningQueries; }
        
        public int getMaxUsedConnections() { return maxUsedConnections; }
        public void setMaxUsedConnections(int maxUsedConnections) { this.maxUsedConnections = maxUsedConnections; }
        
        public long getSlowQueries() { return slowQueries; }
        public void setSlowQueries(long slowQueries) { this.slowQueries = slowQueries; }
        
        public long getTotalQueries() { return totalQueries; }
        public void setTotalQueries(long totalQueries) { this.totalQueries = totalQueries; }
        
        public Map<String, String> getQueryCacheStats() { return queryCacheStats; }
        public void setQueryCacheStats(Map<String, String> queryCacheStats) { this.queryCacheStats = queryCacheStats; }
    }
    
    public static class TableStatistics {
        private String tableName;
        private long tableRows;
        private long dataLength;
        private long indexLength;
        private long dataFree;
        private Long autoIncrement;
        private java.sql.Timestamp createTime;
        private java.sql.Timestamp updateTime;
        
        public TableStatistics(String tableName, long tableRows, long dataLength, long indexLength,
                             long dataFree, Long autoIncrement, java.sql.Timestamp createTime,
                             java.sql.Timestamp updateTime) {
            this.tableName = tableName;
            this.tableRows = tableRows;
            this.dataLength = dataLength;
            this.indexLength = indexLength;
            this.dataFree = dataFree;
            this.autoIncrement = autoIncrement;
            this.createTime = createTime;
            this.updateTime = updateTime;
        }
        
        // Getters
        public String getTableName() { return tableName; }
        public long getTableRows() { return tableRows; }
        public long getDataLength() { return dataLength; }
        public long getIndexLength() { return indexLength; }
        public long getDataFree() { return dataFree; }
        public Long getAutoIncrement() { return autoIncrement; }
        public java.sql.Timestamp getCreateTime() { return createTime; }
        public java.sql.Timestamp getUpdateTime() { return updateTime; }
    }
    
    public static class IndexStatistics {
        private String tableName;
        private String indexName;
        private String columnName;
        private int seqInIndex;
        private Long cardinality;
        private Integer subPart;
        private String nullable;
        private String indexType;
        
        public IndexStatistics(String tableName, String indexName, String columnName, int seqInIndex,
                             Long cardinality, Integer subPart, String nullable, String indexType) {
            this.tableName = tableName;
            this.indexName = indexName;
            this.columnName = columnName;
            this.seqInIndex = seqInIndex;
            this.cardinality = cardinality;
            this.subPart = subPart;
            this.nullable = nullable;
            this.indexType = indexType;
        }
        
        // Getters
        public String getTableName() { return tableName; }
        public String getIndexName() { return indexName; }
        public String getColumnName() { return columnName; }
        public int getSeqInIndex() { return seqInIndex; }
        public Long getCardinality() { return cardinality; }
        public Integer getSubPart() { return subPart; }
        public String getNullable() { return nullable; }
        public String getIndexType() { return indexType; }
    }
}