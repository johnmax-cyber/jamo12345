package com.susanscompany.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.susanscompany.app.data.Product
import com.susanscompany.app.ui.screens.ContactScreen
import com.susanscompany.app.ui.screens.HomeScreen
import com.susanscompany.app.ui.screens.ShopScreen
import com.susanscompany.app.viewmodel.ProductViewModel

sealed class Screen(val route: String, val label: String) {
    object Home : Screen("home", "Home")
    object Shop : Screen("shop", "Shop")
    object Contact : Screen("contact", "Contact")
}

@Composable
fun AppNavigation(
    navController: NavHostController,
    productViewModel: ProductViewModel,
    onOrderProduct: (Product) -> Unit,
    onWhatsAppSupportClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Home.route,
        modifier = modifier
    ) {
        composable(Screen.Home.route) {
            HomeScreen(
                productViewModel = productViewModel,
                onNavigateToShop = {
                    navController.navigate(Screen.Shop.route) {
                        popUpTo(Screen.Home.route) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
                onOrderProduct = onOrderProduct
            )
        }

        composable(Screen.Shop.route) {
            ShopScreen(
                productViewModel = productViewModel,
                onOrderClick = onOrderProduct
            )
        }

        composable(Screen.Contact.route) {
            ContactScreen(
                onWhatsAppClick = onWhatsAppSupportClick
            )
        }
    }
}
