export async function GET() {
  const content = `# VisionPipe3D

> Real-time hand tracking meets Three.js. Build gesture-controlled 3D experiences that respond to natural hand movements.

## Overview

VisionPipe3D is a hand tracking and gesture control platform that enables developers to build interactive 3D experiences controlled by natural hand movements. The platform combines MediaPipe's hand tracking technology with Three.js for real-time 3D visualization.

## Website

https://visionpipe3d.quochuy.dev

## Features

- **Real-time Hand Tracking**: Track 21 hand landmarks at 30fps using MediaPipe
- **3D Integration**: Seamless integration with Three.js for gesture-controlled 3D experiences
- **Cloud API**: Access hand tracking APIs from anywhere without managing infrastructure
- **Browser-based**: Runs locally in the browser using WebGL acceleration

## Pages

### Home (/)
Landing page showcasing VisionPipe3D's hand tracking capabilities with interactive demos.

### Documentation (/docs)
Comprehensive documentation for integrating VisionPipe3D into your applications.

- Getting Started Guide
- Sample Projects (Branch Opening, Video Introduction)
- FAQ
- Cloud API documentation (API Keys, Pricing)

### Blog (/blog)
Latest news, tutorials, and updates about VisionPipe3D.

Categories:
- Showcase: Demo projects and implementations
- Release: Version announcements and changelogs
- Announcement: Company and product news

### Pricing (/pricing)
Two pricing tiers available:

**Standard Plan - $29/month**
- 10,000 API calls/month
- Basic hand tracking
- Community support
- Standard latency
- Email support

**Enterprise Plan - Custom pricing**
- Unlimited API calls
- Advanced gesture recognition
- Priority support
- Low latency endpoints
- Dedicated account manager
- Custom integrations
- SLA guarantee

### Playground (/playground)
Interactive demo where users can try hand tracking. Control 3D text with hand movements in real-time. Requires sign-in and uses credits (1 credit per session).

### Cloud (/cloud)
Landing page for VisionPipe3D Cloud services - access powerful hand tracking APIs from anywhere.

### Station (/station)
Central hub for managing VisionPipe3D deployments and configurations.

Features:
- Deployment Status monitoring
- Configuration management
- Analytics and performance metrics

### About Us (/about-us)
Information about VisionPipe3D's mission to democratize hand tracking technology.

Contact:
- Email: contact@visionpipe3d.com
- GitHub: github.com/quochuydev/visionpipe3d

### Terms of Service (/terms)
Legal terms and conditions for using VisionPipe3D services.

### Privacy Policy (/privacy)
Privacy policy explaining data collection, camera/video data handling, and user rights. Camera processing happens locally in the browser - no video data is stored or transmitted.

## Cloud Dashboard (/c/cloud/*)

Authenticated area for managing cloud services:
- **API Keys** (/c/cloud/api-keys): Create and manage API keys
- **Usage** (/c/cloud/usage): View API usage statistics
- **Billing** (/c/cloud/billing): Manage billing and credits

## Technical Stack

- **Framework**: Next.js (App Router)
- **Hand Tracking**: MediaPipe Hands
- **3D Graphics**: Three.js
- **Authentication**: Clerk
- **Documentation**: Fumadocs
- **Styling**: Tailwind CSS

## Keywords

hand tracking, MediaPipe, Three.js, 3D, gesture control, WebGL, computer vision, real-time tracking, gesture recognition, touchless interface

## Contact

For inquiries: contact@visionpipe3d.com
For legal: legal@visionpipe3d.com
For privacy: privacy@visionpipe3d.com
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
