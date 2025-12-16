# Simple Test - Check if visualization endpoints exist
import sys
sys.path.insert(0, '.')

print("=" * 60)
print("CHECKING VISUALIZATION MODULE")
print("=" * 60)

try:
    from api.routers import visualize
    print("✅ visualize module imported successfully")
    print(f"   Router: {visualize.router}")
    print(f"   Routes: {[route.path for route in visualize.router.routes]}")
except Exception as e:
    print(f"❌ Failed to import visualize: {e}")
    import traceback
    traceback.print_exc()

print()
try:
    from api.utils import OverlayRenderer, create_multimode_visualization
    print("✅ OverlayRenderer imported successfully")
    print(f"   Class: {OverlayRenderer}")
    print(f"   Function: {create_multimode_visualization}")
except Exception as e:
    print(f"❌ Failed to import OverlayRenderer: {e}")
    import traceback
    traceback.print_exc()

print()
print("=" * 60)
print("Module checks complete!")
print("=" * 60)
