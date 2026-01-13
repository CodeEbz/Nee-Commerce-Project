# Nee Commerce - WhatsApp Business E-commerce Platform

A revolutionary e-commerce platform that bridges WhatsApp Business catalogs with seamless online shopping. Customers can browse businesses, sync products directly from WhatsApp catalog links, and complete purchases through a professional checkout system.

## 🚀 Features

### Core Functionality
- **WhatsApp Integration**: Sync products directly from WhatsApp Business catalog links
- **Professional Store Directory**: Browse curated businesses across multiple categories
- **Smart Product Sync**: Parse WhatsApp links in format `https://wa.me/p/PRODUCT_ID/BUSINESS_NUMBER`
- **Shopping Cart**: Temporary cart system with quantity management
- **Secure Checkout**: Complete order processing with customer information
- **Order Management**: Track sales without requiring a database
- **Admin Dashboard**: Monitor orders, revenue, and analytics

### Technical Features
- **Modern UI/UX**: Professional design with glassmorphism effects
- **Responsive Design**: Works perfectly on desktop and mobile
- **Real-time Sync**: Instant product synchronization from WhatsApp
- **JSON-based Storage**: No database required - uses JSON files
- **RESTful API**: Clean FastAPI backend with comprehensive endpoints

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Pydantic**: Data validation and serialization
- **JSON Storage**: File-based data management
- **CORS**: Cross-origin resource sharing enabled

### Frontend
- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **Lucide React**: Beautiful icon library
- **Custom CSS**: Professional styling with CSS variables

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the backend server**
   ```bash
   python main.py
   ```
   
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173`

## 🔧 Configuration

### Backend Configuration
- **Port**: Default 8000 (configurable in `main.py`)
- **CORS**: Currently allows all origins (update for production)
- **Data Storage**: `backend/data/` directory

### Frontend Configuration
- **API URL**: Update in components if backend URL changes
- **Styling**: Modify CSS variables in `src/index.css`

## 📱 How It Works

### For Customers

1. **Browse Stores**: Visit the homepage and explore featured businesses
2. **Visit WhatsApp Catalog**: Click "View WhatsApp Catalog" on any business page
3. **Copy Product Link**: In WhatsApp, find a product and copy its link
4. **Sync Product**: Paste the link in the Sync Station on the website
5. **Add to Cart**: Review the synced product and add to cart
6. **Checkout**: Complete purchase with customer information

### For Business Owners

1. **WhatsApp Business Setup**: Ensure your WhatsApp Business has a catalog
2. **Product IDs**: Each product needs a unique WhatsApp ID
3. **Link Format**: Products accessible via `https://wa.me/p/PRODUCT_ID/BUSINESS_NUMBER`
4. **Catalog Integration**: Add your business to `backend/data/catalog.json`

### For Administrators

1. **Access Dashboard**: Visit `/admin` to view orders and analytics
2. **Monitor Sales**: Track revenue, customer count, and product sales
3. **Order Management**: View detailed order information and customer data

## 🔗 WhatsApp Link Formats Supported

The platform supports multiple WhatsApp link formats:

```
✅ https://wa.me/p/24596434279999779/2348027550551
✅ https://wa.me/p/PRODUCT_ID
✅ https://www.whatsapp.com/catalog/PRODUCT_ID
✅ Direct Product ID: 24596434279999779
✅ Product Code: HERB001
```

## 📊 API Endpoints

### Public Endpoints
- `GET /` - API welcome message
- `GET /businesses` - List all businesses and products
- `GET /sync/{identifier}` - Sync product by WhatsApp link or ID
- `POST /checkout` - Process customer checkout
- `GET /orders` - List all orders (admin)

### Example API Usage

**Sync a product:**
```bash
curl "http://localhost:8000/sync/https://wa.me/p/24596434279999779/2348027550551"
```

**Process checkout:**
```bash
curl -X POST "http://localhost:8000/checkout" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+2348123456789",
    "items": [...],
    "total_amount": 16000
  }'
```

## 🧪 Testing

Run the integration test script to verify everything works:

```bash
python test_integration.py
```

This will test:
- WhatsApp link parsing
- Product synchronization
- Checkout flow
- Order management

## 📁 Project Structure

```
Nee Commerce Project/
├── backend/
│   ├── data/
│   │   ├── catalog.json      # Business and product data
│   │   └── orders.json       # Order records
│   ├── main.py              # FastAPI application
│   ├── data_manager.py      # Data handling logic
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── App.jsx         # Main app component
│   │   └── index.css       # Global styles
│   ├── package.json        # Node dependencies
│   └── vite.config.js      # Vite configuration
├── test_integration.py     # Integration tests
└── README.md              # This file
```

## 🎨 Customization

### Adding New Businesses

Edit `backend/data/catalog.json`:

```json
{
  "id": "biz_new",
  "name": "Your Business Name",
  "slug": "your-business",
  "category": "Your Category",
  "description": "Business description",
  "whatsapp_link": "https://wa.me/c/YOUR_BUSINESS_NUMBER",
  "hero_image": "https://your-image-url.com/hero.jpg",
  "logo": "https://your-image-url.com/logo.jpg",
  "featured": true,
  "products": [
    {
      "code": "PROD001",
      "whatsapp_id": "YOUR_WHATSAPP_PRODUCT_ID",
      "name": "Product Name",
      "price": 10000,
      "description": "Product description",
      "image": "https://your-image-url.com/product.jpg",
      "featured": true
    }
  ]
}
```

### Styling Customization

Modify CSS variables in `frontend/src/index.css`:

```css
:root {
  --primary: #0F172A;        /* Primary color */
  --accent: #3B82F6;         /* Accent color */
  --success: #10B981;        /* Success color */
  --warning: #F59E0B;        /* Warning color */
  /* ... more variables */
}
```

## 🚀 Deployment

### Backend Deployment
1. Use a service like Railway, Heroku, or DigitalOcean
2. Set environment variables for production
3. Update CORS settings for your domain
4. Ensure data directory is writable

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy to Vercel, Netlify, or similar service
3. Update API URLs to point to your backend

## 🔒 Security Considerations

- **CORS**: Update CORS settings for production
- **Input Validation**: All inputs are validated via Pydantic
- **Data Storage**: Consider database migration for production
- **Authentication**: Add admin authentication for production
- **HTTPS**: Use HTTPS in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the integration test script for troubleshooting
- Ensure both backend and frontend servers are running
- Verify WhatsApp link formats are correct
- Check browser console for frontend errors
- Check terminal output for backend errors

## 🎯 Roadmap

- [ ] Payment gateway integration (Paystack, Flutterwave)
- [ ] Database migration (PostgreSQL, MongoDB)
- [ ] User authentication system
- [ ] Business owner dashboard
- [ ] Mobile app development
- [ ] Advanced analytics
- [ ] Inventory management
- [ ] Multi-language support

---

**Built with ❤️ for the future of social commerce in Africa**