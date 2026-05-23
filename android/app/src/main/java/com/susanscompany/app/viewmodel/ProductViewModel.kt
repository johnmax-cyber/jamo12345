package com.susanscompany.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.susanscompany.app.data.Product
import com.susanscompany.app.network.SupabaseClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

sealed interface ProductUiState {
    object Idle : ProductUiState
    object Loading : ProductUiState
    data class Success(
        val products: List<Product>,
        val hasMore: Boolean = true,
        val isFirstPage: Boolean = true
    ) : ProductUiState
    data class Error(val message: String) : ProductUiState
}

class ProductViewModel : ViewModel() {

    // Main shop state
    private val _uiState = MutableStateFlow<ProductUiState>(ProductUiState.Idle)
    val uiState: StateFlow<ProductUiState> = _uiState.asStateFlow()

    // Separate pre-fetched home screen previews to guarantee offline or quick rendering
    private val _homeClothes = MutableStateFlow<List<Product>>(emptyList())
    val homeClothes: StateFlow<List<Product>> = _homeClothes.asStateFlow()

    private val _homeBooks = MutableStateFlow<List<Product>>(emptyList())
    val homeBooks: StateFlow<List<Product>> = _homeBooks.asStateFlow()

    private val _isHomeLoading = MutableStateFlow(false)
    val isHomeLoading: StateFlow<Boolean> = _isHomeLoading.asStateFlow()

    private val _homeError = MutableStateFlow<String?>(null)
    val homeError: StateFlow<String?> = _homeError.asStateFlow()

    // Filters for shop view
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _selectedFilter = MutableStateFlow("All") // "All", "Clothes", "Books", "Sale"
    val selectedFilter: StateFlow<String> = _selectedFilter.asStateFlow()

    private var currentOffset = 0L
    private val limitPerPage = 12L
    private val loadedProductsList = mutableListOf<Product>()

    init {
        loadHomePreviews()
        loadShopProducts(isRefresh = true)
    }

    /**
     * Loads the specific 6 preview entries for clothes and books shown on the Home screen.
     */
    fun loadHomePreviews() {
        viewModelScope.launch {
            _isHomeLoading.value = true
            _homeError.value = null
            try {
                val clothes = SupabaseClient.fetchProducts(category = "clothes", limit = 6, offset = 0)
                val books = SupabaseClient.fetchProducts(category = "books", limit = 6, offset = 0)
                _homeClothes.value = clothes
                _homeBooks.value = books
            } catch (e: Exception) {
                _homeError.value = "Failed to load shop previews: ${e.message}"
            } finally {
                _isHomeLoading.value = false
            }
        }
    }

    /**
     * Resets indicators and initiates full shop product collection query.
     */
    fun loadShopProducts(isRefresh: Boolean = false) {
        viewModelScope.launch {
            if (isRefresh) {
                currentOffset = 0L
                loadedProductsList.clear()
                _uiState.update { ProductUiState.Loading }
            }

            try {
                // Map local visual filters onto Supabase API arguments
                val catQuery = when (_selectedFilter.value) {
                    "Clothes" -> "clothes"
                    "Books" -> "books"
                    else -> null
                }
                val onlySale = _selectedFilter.value == "Sale"

                val fetched = SupabaseClient.fetchProducts(
                    category = catQuery,
                    searchQuery = _searchQuery.value.takeIf { it.isNotBlank() },
                    onlySale = onlySale,
                    limit = limitPerPage,
                    offset = currentOffset
                )

                loadedProductsList.addAll(fetched)
                val hasMore = fetched.size >= limitPerPage

                _uiState.update {
                    ProductUiState.Success(
                        products = loadedProductsList.toList(),
                        hasMore = hasMore,
                        isFirstPage = currentOffset == 0L
                    )
                }
            } catch (e: Exception) {
                if (currentOffset == 0L) {
                    _uiState.update { ProductUiState.Error(e.message ?: "Unknown error fetching products") }
                } else {
                    // Fail silently for page scrolling increment, keeping previous items visible
                }
            }
        }
    }

    /**
     * Increment offset size and retrieve next batch of items.
     */
    fun loadMoreProducts() {
        val currentState = _uiState.value
        if (currentState is ProductUiState.Success && currentState.hasMore) {
            currentOffset += limitPerPage
            loadShopProducts(isRefresh = false)
        }
    }

    /**
     * Handles real-time search term alteration.
     */
    fun onSearchQueryChanged(query: String) {
        _searchQuery.value = query
        loadShopProducts(isRefresh = true)
    }

    /**
     * Select filters such as "All", "Clothes", "Books", or "Sale".
     */
    fun onFilterSelected(filter: String) {
        _selectedFilter.value = filter
        loadShopProducts(isRefresh = true)
    }
}
