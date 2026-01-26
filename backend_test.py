import requests
import sys
import json
from datetime import datetime

class ECommerceAPITester:
    def __init__(self, base_url="https://ecom-sphere.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.admin_user_id = None
        self.product_id = None
        self.cart_item_id = None
        self.order_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, use_admin=False):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        # Use appropriate token
        token = self.admin_token if use_admin else self.token
        if token:
            test_headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.text else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_seed_database(self):
        """Test database seeding"""
        success, response = self.run_test(
            "Seed Database",
            "POST",
            "seed",
            200
        )
        return success

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@atelier.com", "password": "admin123"}
        )
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            self.admin_user_id = response['user']['id']
            print(f"   Admin token obtained: {self.admin_token[:20]}...")
            return True
        return False

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "username": f"testuser_{timestamp}",
                "email": f"test_{timestamp}@example.com",
                "password": "testpass123"
            }
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            print(f"   User token obtained: {self.token[:20]}...")
            return True
        return False

    def test_get_products(self):
        """Test getting all products"""
        success, response = self.run_test(
            "Get All Products",
            "GET",
            "products",
            200
        )
        if success and isinstance(response, list) and len(response) > 0:
            self.product_id = response[0]['id']
            print(f"   Found {len(response)} products")
            print(f"   Using product ID: {self.product_id}")
            return True
        return False

    def test_get_product_categories(self):
        """Test getting product categories"""
        success, response = self.run_test(
            "Get Product Categories",
            "GET",
            "products/categories",
            200
        )
        if success and 'categories' in response:
            print(f"   Found categories: {response['categories']}")
            return True
        return False

    def test_get_single_product(self):
        """Test getting a single product"""
        if not self.product_id:
            print("❌ No product ID available for testing")
            return False
        
        success, response = self.run_test(
            "Get Single Product",
            "GET",
            f"products/{self.product_id}",
            200
        )
        return success

    def test_get_featured_products(self):
        """Test getting featured products"""
        success, response = self.run_test(
            "Get Featured Products",
            "GET",
            "products?featured=true",
            200
        )
        if success:
            featured_count = len([p for p in response if p.get('featured', False)])
            print(f"   Found {featured_count} featured products")
            return True
        return False

    def test_get_cart_empty(self):
        """Test getting empty cart"""
        success, response = self.run_test(
            "Get Empty Cart",
            "GET",
            "cart",
            200
        )
        if success and response.get('item_count', 0) == 0:
            print("   Cart is empty as expected")
            return True
        return False

    def test_add_to_cart(self):
        """Test adding item to cart"""
        if not self.product_id:
            print("❌ No product ID available for cart testing")
            return False
        
        success, response = self.run_test(
            "Add Item to Cart",
            "POST",
            "cart/items",
            200,
            data={
                "product_id": self.product_id,
                "quantity": 2,
                "size": "M",
                "color": "Black"
            }
        )
        if success and response.get('item_count', 0) > 0:
            self.cart_item_id = response['items'][0]['id']
            print(f"   Cart item ID: {self.cart_item_id}")
            return True
        return False

    def test_get_cart_with_items(self):
        """Test getting cart with items"""
        success, response = self.run_test(
            "Get Cart with Items",
            "GET",
            "cart",
            200
        )
        if success and response.get('item_count', 0) > 0:
            print(f"   Cart has {response['item_count']} items, total: ${response['total']}")
            return True
        return False

    def test_update_cart_item(self):
        """Test updating cart item quantity"""
        if not self.cart_item_id:
            print("❌ No cart item ID available for testing")
            return False
        
        success, response = self.run_test(
            "Update Cart Item",
            "PUT",
            f"cart/items/{self.cart_item_id}",
            200,
            data={"quantity": 3}
        )
        return success

    def test_create_order(self):
        """Test creating an order"""
        success, response = self.run_test(
            "Create Order",
            "POST",
            "orders",
            200,
            data={
                "shipping_address": {
                    "full_name": "Test User",
                    "address_line1": "123 Test Street",
                    "address_line2": "",
                    "city": "Test City",
                    "state": "TS",
                    "postal_code": "12345",
                    "country": "United States",
                    "phone": "+1234567890"
                }
            }
        )
        if success and 'id' in response:
            self.order_id = response['id']
            print(f"   Order ID: {self.order_id}")
            return True
        return False

    def test_get_orders(self):
        """Test getting user orders"""
        success, response = self.run_test(
            "Get User Orders",
            "GET",
            "orders",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} orders")
            return True
        return False

    def test_get_single_order(self):
        """Test getting a single order"""
        if not self.order_id:
            print("❌ No order ID available for testing")
            return False
        
        success, response = self.run_test(
            "Get Single Order",
            "GET",
            f"orders/{self.order_id}",
            200
        )
        return success

    def test_admin_create_product(self):
        """Test admin creating a product"""
        success, response = self.run_test(
            "Admin Create Product",
            "POST",
            "admin/products",
            200,
            data={
                "name": "Test Product",
                "description": "A test product for API testing",
                "price": 99.99,
                "category": "T-Shirts",
                "sizes": ["S", "M", "L"],
                "colors": ["Red", "Blue"],
                "image_url": "https://example.com/test.jpg",
                "stock": 50,
                "featured": False
            },
            use_admin=True
        )
        if success and 'id' in response:
            print(f"   Created product ID: {response['id']}")
            return True
        return False

    def test_admin_get_orders(self):
        """Test admin getting all orders"""
        success, response = self.run_test(
            "Admin Get All Orders",
            "GET",
            "admin/orders",
            200,
            use_admin=True
        )
        if success and isinstance(response, list):
            print(f"   Admin found {len(response)} total orders")
            return True
        return False

    def test_admin_update_order_status(self):
        """Test admin updating order status"""
        if not self.order_id:
            print("❌ No order ID available for status update testing")
            return False
        
        success, response = self.run_test(
            "Admin Update Order Status",
            "PUT",
            f"admin/orders/{self.order_id}/status?status=processing",
            200,
            use_admin=True
        )
        return success

    def test_auth_me_endpoint(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User Info",
            "GET",
            "auth/me",
            200
        )
        if success and 'id' in response:
            print(f"   User ID: {response['id']}, Username: {response.get('username', 'N/A')}")
            return True
        return False

def main():
    print("🚀 Starting E-Commerce API Tests")
    print("=" * 50)
    
    tester = ECommerceAPITester()
    
    # Test sequence
    tests = [
        ("Root Endpoint", tester.test_root_endpoint),
        ("Seed Database", tester.test_seed_database),
        ("Admin Login", tester.test_admin_login),
        ("User Registration", tester.test_user_registration),
        ("Get Products", tester.test_get_products),
        ("Get Categories", tester.test_get_product_categories),
        ("Get Single Product", tester.test_get_single_product),
        ("Get Featured Products", tester.test_get_featured_products),
        ("Get Empty Cart", tester.test_get_cart_empty),
        ("Add to Cart", tester.test_add_to_cart),
        ("Get Cart with Items", tester.test_get_cart_with_items),
        ("Update Cart Item", tester.test_update_cart_item),
        ("Auth Me Endpoint", tester.test_auth_me_endpoint),
        ("Create Order", tester.test_create_order),
        ("Get User Orders", tester.test_get_orders),
        ("Get Single Order", tester.test_get_single_order),
        ("Admin Create Product", tester.test_admin_create_product),
        ("Admin Get Orders", tester.test_admin_get_orders),
        ("Admin Update Order Status", tester.test_admin_update_order_status),
    ]
    
    failed_tests = []
    
    for test_name, test_func in tests:
        try:
            if not test_func():
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")
            failed_tests.append(test_name)
    
    # Print results
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS")
    print("=" * 50)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {len(failed_tests)}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if failed_tests:
        print(f"\n❌ Failed Tests:")
        for test in failed_tests:
            print(f"   - {test}")
    else:
        print(f"\n✅ All tests passed!")
    
    return 0 if len(failed_tests) == 0 else 1

if __name__ == "__main__":
    sys.exit(main())