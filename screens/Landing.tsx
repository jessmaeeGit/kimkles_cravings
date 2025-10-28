import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/AppStore';

const { width } = Dimensions.get('window');

export default function Landing() {
  const insets = useSafeAreaInsets();
  const { user, setScreen } = useAppStore();

  const features = [
    {
      title: 'Fresh Kimkles Desserts',
      description: 'Handcrafted daily with premium ingredients',
      icon: '🍪',
      color: '#FFD9E8',
    },
    {
      title: 'Made with Love',
      description: 'Every treat here is made with love just for you.',
      icon: '❤️',
      color: '#C8F9FD',
    },
    {
      title: 'Bite into Happiness',
      description: 'Freshly Baked Cookies, Brownies & Crinkles!',
      icon: '✨',
      color: '#FEC9F0',
    },
  ];
  

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../images/kimkles_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.welcomeText}>
            Welcome back, {user?.name || 'Friend'}! 👋
          </Text>
          <Text style={styles.subtitle}>
            Ready to satisfy your sweet cravings?
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Why Choose Kimkles?</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={[styles.featureCard, { backgroundColor: feature.color }]}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Happy Customers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>Dessert Varieties</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4.9★</Text>
            <Text style={styles.statLabel}>Customer Rating</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]} 
            activeOpacity={0.85}
            onPress={() => setScreen('home')}
          >
            <Text style={styles.primaryButtonText}>Browse Menu 🍰</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]} 
            activeOpacity={0.85}
            onPress={() => setScreen('orders')}
          >
            <Text style={styles.secondaryButtonText}>View My Orders 📦</Text>
          </TouchableOpacity>
        </View>

        {/* Special Offer Banner */}
        {/* <View style={styles.offerBanner}>
          <Text style={styles.offerTitle}>🎉 Special Offer!</Text>
          <Text style={styles.offerText}>
            Get 10% off on orders above ₱500
          </Text>
          <Text style={styles.offerCode}>Use code: SWEET10</Text>
        </View> */}

        {/* Footer */}
        <View style={styles.footer}>
          {/* Main Footer Content - 2x2 Grid */}
          <View style={styles.footerMain}>
            {/* Row 1 */}
            <View style={styles.footerRow}>
              {/* Company Branding */}
              <View style={styles.footerSection}>
                <View style={styles.footerBranding}>
                  <Image
                    source={require('../images/kimkles_logo.png')}
                    style={styles.footerLogo}
                    resizeMode="contain"
                  />
                  <Text style={styles.footerCompanyName}>Kimkles Cravings</Text>
                  <Text style={styles.footerTagline}>Sweet Delights</Text>
                </View>
                <Text style={styles.footerDescription}>
                  Your go-to destination for authentic Filipino desserts and cakes in Iligan City.
                </Text>
                <View style={styles.socialLinks}>
                  {/* Facebook */}
                  <TouchableOpacity
                    onPress={() => Linking.openURL('https://www.facebook.com/profile.php?id=61577883586220')}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: 'https://cdn-icons-png.flaticon.com/512/733/733547.png' }}
                      style={styles.socialIconImage}
                    />
                  </TouchableOpacity>

                  {/* Instagram */}
                  <TouchableOpacity
                    onPress={() => Linking.openURL('https://www.instagram.com/hartsueeee/')}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png' }}
                      style={styles.socialIconImage}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Quick Links
              <View style={styles.footerSection}>
                <Text style={styles.footerHeading}>Quick Links</Text>
                <Text style={styles.footerLink}>Home</Text>
                <Text style={styles.footerLink}>Menu</Text>
                <Text style={styles.footerLink}>About Us</Text>
                <Text style={styles.footerLink}>Contact</Text>
              </View>
            </View>
            <View style={styles.footerRow}>
              <View style={styles.footerSection}>
                <Text style={styles.footerHeading}>Services</Text>
                <Text style={styles.footerLink}>Online Ordering</Text>
                <Text style={styles.footerLink}>Delivery</Text>
                <Text style={styles.footerLink}>Catering</Text>
                <Text style={styles.footerLink}>Custom Cakes</Text>
              </View> */}

              {/* Get In Touch */}
              <View style={styles.footerSection}>
                <Text style={styles.footerHeading}>Get In Touch</Text>
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>📍</Text>
                  <Text style={styles.contactText}>Prk. Sta. Lucia, Mahayahay, Iligan City, Philippines, 9200</Text>
                </View>
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>📞</Text>
                  <Text style={styles.contactText}>+63 9381565656</Text>
                </View>
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>✉️</Text>
                  <Text style={styles.contactText}>kimklescravings@gmail.com</Text>
                </View>
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>🕘</Text>
                  <Text style={styles.contactText}>9:00 AM - 9:00 PM Daily</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Copyright Section */}
          <View style={styles.footerBottom}>
            <Text style={styles.copyrightText}>© 2025 Kimkles Cravings. All rights reserved.</Text>
            {/* <View style={styles.legalLinks}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
              <Text style={styles.legalLink}>Terms of Service</Text>
            </View> */}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8D8FF',
  },
  content: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  header: {
    alignItems: 'center',
    // marginTop: 1,
    marginBottom: 5,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresGrid: {
    gap: 12,
  },
  featureCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  socialIconImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  actionContainer: {
    gap: 12,
    marginBottom: 30,
  },
  actionButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButton: {
    backgroundColor: '#FFB74D',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFB74D',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFB74D',
  },
  offerBanner: {
    backgroundColor: '#FEC9F0',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFB74D',
    borderStyle: 'dashed',
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  offerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  offerCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  footer: {
    backgroundColor: '#FEC9F0',
    marginTop: 20,
    marginHorizontal: -20,
  },
  footerMain: {
    padding: 20,
    gap: 25,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 5,
  },
  footerSection: {
    flex: 1,
  },
  footerBranding: {
    alignItems: 'center',
    marginBottom: 5,
  },
  footerLogo: {
    width: 120,
    height: 120,
    marginBottom: 1,
  },
  footerCompanyName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 4,
  },
  footerTagline: {
    fontSize: 13,
    color: '#000000',
    fontWeight: '500',
  },
  footerDescription: {
    fontSize: 12,
    color: '#000000',
    lineHeight: 15,
    marginBottom: 16,
    textAlign: 'center',
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  socialIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  footerHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    marginTop: 45,
  },
  footerLink: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
    fontWeight: '500',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 20,
  },
  contactText: {
    fontSize: 10,
    color: '#000000',
    flex: 1,
    fontWeight: '500',
  },
  footerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#000000',
  },
  copyrightText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
  },
  legalLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  legalLink: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
  },
});
