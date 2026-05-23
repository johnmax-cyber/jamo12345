package com.susanscompany.app

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.susanscompany.app.data.Product
import com.susanscompany.app.ui.components.FloatingWhatsAppButton
import com.susanscompany.app.ui.navigation.AppNavigation
import com.susanscompany.app.ui.navigation.Screen
import com.susanscompany.app.ui.theme.ForestGreen
import com.susanscompany.app.ui.theme.PerfectWhite
import com.susanscompany.app.ui.theme.SusansCompanyTheme
import com.susanscompany.app.ui.theme.WarmGold
import com.susanscompany.app.viewmodel.OrderUiState
import com.susanscompany.app.viewmodel.OrderViewModel
import com.susanscompany.app.viewmodel.ProductViewModel
import java.net.URLEncoder

class MainActivity : ComponentActivity() {

    private val productViewModel: ProductViewModel by viewModels()
    private val orderViewModel: OrderViewModel by viewModels()

    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SusansCompanyTheme {
                val navController = rememberNavController()
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route ?: Screen.Home.route

                // Listen to orders transaction status flow from OrderViewModel
                val orderState by orderViewModel.orderState.collectAsState()

                LaunchedEffect(orderState) {
                    when (val state = orderState) {
                        is OrderUiState.Success -> {
                            Toast.makeText(
                                this@MainActivity,
                                "Opening WhatsApp... Your order for \"${state.productName}\" is tracked!",
                                Toast.LENGTH_LONG
                            ).show()
                            openWhatsAppWithMessage(state.whatsappMessage)
                            orderViewModel.resetOrderState()
                        }
                        is OrderUiState.Error -> {
                            Toast.makeText(
                                this@MainActivity,
                                "Order sync failed: ${state.errorMsg}",
                                Toast.LENGTH_LONG
                            ).show()
                            orderViewModel.resetOrderState()
                        }
                        else -> { /* Idle or Loading */ }
                    }
                }

                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFFF5F5F5)
                ) {
                    Scaffold(
                        topBar = {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(ForestGreen)
                                    .padding(horizontal = 16.dp, vertical = 12.dp)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "🌿",
                                        fontSize = 20.sp,
                                        modifier = Modifier.padding(end = 8.dp)
                                    )
                                    Column {
                                        Text(
                                            text = "Susan's Company",
                                            color = Color.White,
                                            fontSize = 20.sp,
                                            fontWeight = FontWeight.Bold,
                                            fontFamily = FontFamily.Serif
                                        )
                                        Text(
                                            text = "Modest Fashion & Books",
                                            color = WarmGold,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            fontFamily = FontFamily.SansSerif,
                                            letterSpacing = 0.5.sp
                                        )
                                    }
                                }
                            }
                        },
                        bottomBar = {
                            NavigationBar(
                                containerColor = Color.White,
                                tonalElevation = 8.dp
                            ) {
                                // Home navigation element
                                NavigationBarItem(
                                    selected = currentRoute == Screen.Home.route,
                                    onClick = {
                                        navController.navigate(Screen.Home.route) {
                                            popUpTo(navController.graph.findStartDestination().id) {
                                                saveState = true
                                            }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    },
                                    icon = { Icon(Icons.Default.Home, contentDescription = "Home View Button") },
                                    label = { Text("Home", fontSize = 11.sp) },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = ForestGreen,
                                        selectedTextColor = ForestGreen,
                                        indicatorColor = WarmGold.copy(alpha = 0.2f),
                                        unselectedIconColor = Color.Gray,
                                        unselectedTextColor = Color.Gray
                                    )
                                )

                                // Shop grid navigation element
                                NavigationBarItem(
                                    selected = currentRoute == Screen.Shop.route,
                                    onClick = {
                                        navController.navigate(Screen.Shop.route) {
                                            popUpTo(navController.graph.findStartDestination().id) {
                                                saveState = true
                                            }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    },
                                    icon = { Icon(Icons.Default.ShoppingBag, contentDescription = "Shop Page Button") },
                                    label = { Text("Shop", fontSize = 11.sp) },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = ForestGreen,
                                        selectedTextColor = ForestGreen,
                                        indicatorColor = WarmGold.copy(alpha = 0.2f),
                                        unselectedIconColor = Color.Gray,
                                        unselectedTextColor = Color.Gray
                                    )
                                )

                                // Contact sheet navigation element
                                NavigationBarItem(
                                    selected = currentRoute == Screen.Contact.route,
                                    onClick = {
                                        navController.navigate(Screen.Contact.route) {
                                            popUpTo(navController.graph.findStartDestination().id) {
                                                saveState = true
                                            }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    },
                                    icon = { Icon(Icons.Default.Call, contentDescription = "Contact View Button") },
                                    label = { Text("Contact", fontSize = 11.sp) },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = ForestGreen,
                                        selectedTextColor = ForestGreen,
                                        indicatorColor = WarmGold.copy(alpha = 0.2f),
                                        unselectedIconColor = Color.Gray,
                                        unselectedTextColor = Color.Gray
                                    )
                                )
                            }
                        },
                        floatingActionButton = {
                            FloatingWhatsAppButton(
                                onClick = { openWhatsAppWithMessage("Hello Susan's Company, I'd like to inquire about your modest fashion collection and inspiring books!") }
                            )
                        }
                    ) { innerPadding ->
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(innerPadding)
                        ) {
                            AppNavigation(
                                navController = navController,
                                productViewModel = productViewModel,
                                onOrderProduct = { product ->
                                    orderViewModel.placeOrder(product)
                                },
                                onWhatsAppSupportClick = {
                                    openWhatsAppWithMessage("Hello Susan's Company, I am visiting your Nairobi showroom showroom, I would like to get in touch!")
                                }
                            )

                            // Loading/Submitting Overlay blocker
                            if (orderState is OrderUiState.Loading) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .background(Color.Black.copy(alpha = 0.45f)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Surface(
                                        shape = CircleShape,
                                        color = PerfectWhite,
                                        modifier = Modifier.padding(16.dp),
                                        shadowElevation = 4.dp
                                    ) {
                                        CircularProgressIndicator(
                                            color = ForestGreen,
                                            modifier = Modifier.padding(16.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Safely triggers WhatsApp application or secondary web browser deep-links.
     */
    private fun openWhatsAppWithMessage(message: String) {
        try {
            val contactNumber = "254700000000"
            val encodedMessage = URLEncoder.encode(message, "UTF-8")
            val whatsappUrl = "https://wa.me/$contactNumber?text=$encodedMessage"
            
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = Uri.parse(whatsappUrl)
            }
            startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(
                this,
                "Unable to open browser or WhatsApp. Check link URL.",
                Toast.LENGTH_SHORT
            ).show()
        }
    }
}
