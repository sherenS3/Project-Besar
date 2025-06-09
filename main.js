
// Global variables
let map;
let currentSlide = 0;
let markers = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavbar();
    initializeMap();
    initializeSlider();
    initializeSearch();
});

// Navbar functionality
function initializeNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    // Scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    });
}

// Map functionality
function initializeMap() {
    // Initialize map centered on Bandung
    map = L.map('mosqueMap').setView([-6.9175, 107.6191], 12);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add mosque markers
    addMosqueMarkers();
}

function addMosqueMarkers() {
    // Custom mosque icon
    const mosqueIcon = L.divIcon({
        className: 'mosque-marker',
        html: '<i class="fas fa-mosque" style="color: #2c5530; font-size: 20px;"></i>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
    
    // Add markers for each mosque
    window.mosqueData.forEach(mosque => {
        const marker = L.marker([mosque.lat, mosque.lng], { icon: mosqueIcon })
            .addTo(map);
        
        // Create popup content
        const popupContent = `
            <div class="popup-content">
                <h3 class="popup-title">${mosque.name}</h3>
               <p class="popup-location">&#128205; ${mosque.address}</p>
               <p class="popup-postal-code">&#128236; ${mosque.postalCode}</p>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        markers.push({ marker, data: mosque });
    });
}

// Map control functions
function goHome() {
    map.setView([-6.9175, 107.6191], 12);
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            map.setView([lat, lng], 15);
            
            // Add user location marker
            L.marker([lat, lng])
                .addTo(map)
                .bindPopup('Your Location')
                .openPopup();
        }, function() {
            alert('Unable to retrieve your location');
        });
    } else {
        alert('Geolocation is not supported by this browser');
    }
}

function zoomIn() {
    map.zoomIn();
}

function zoomOut() {
    map.zoomOut();
}

// Slider functionality
function initializeSlider() {
    const slider = document.getElementById('mosqueSlider');
    const dotsContainer = document.getElementById('sliderDots');
    
    // Create slides
    window.mosqueData.forEach((mosque, index) => {
        // Create slide
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.innerHTML = `
            <div class="slide-content">
                <h3>${mosque.name}</h3>
                <p class="popup-location">&#128205; ${mosque.address}</p>
                <p class="popup-postal-code">&#128236; ${mosque.postalCode}</p>
                <p class="popup-kaca-pemebesar">&#128269;${mosque.facilities}</p>
                
            </div>
            <img src="${mosque.image}" alt="${mosque.name}" class="slide-image">
        `;
        slider.appendChild(slide);
        
        // Create dot
        const dot = document.createElement('div');
        dot.className = 'dot';
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    updateSlider();
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % window.mosqueData.length;
    updateSlider();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + window.mosqueData.length) % window.mosqueData.length;
    updateSlider();
}

function goToSlide(index) {
    currentSlide = index;
    updateSlider();
}

function updateSlider() {
    const slider = document.getElementById('mosqueSlider');
    const dots = document.querySelectorAll('.dot');
    
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchMosque();
        }
    });
}

function searchMosque() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        alert('Please enter a mosque name to search');
        return;
    }
    
    // Find mosque in data
    const foundMosque = window.mosqueData.find(mosque => 
        mosque.name.toLowerCase().includes(searchTerm)
    );
    
    if (foundMosque) {
        // Navigate to map section
        document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
        
        // Center map on found mosque
        setTimeout(() => {
            map.setView([foundMosque.lat, foundMosque.lng], 16);
            
            // Find and open the corresponding marker popup
            const markerData = markers.find(m => m.data.id === foundMosque.id);
            if (markerData) {
                markerData.marker.openPopup();
            }
        }, 1000);
        
        // Navigate to data section and show the corresponding slide
        setTimeout(() => {
            const slideIndex = window.mosqueData.findIndex(mosque => mosque.id === foundMosque.id);
            currentSlide = slideIndex;
            updateSlider();
            document.getElementById('data').scrollIntoView({ behavior: 'smooth' });
        }, 2000);
    } else {
        alert('Mosque not found. Please try another name.');
    }
}

// Parallax effect
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero-bg');
    const speed = scrolled * 0.5;
    
    if (parallax) {
        parallax.style.transform = `translateY(${speed}px)`;
    }
});

// Auto-advance slider
setInterval(nextSlide, 8000);

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.section-header, .slide, .author-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});
