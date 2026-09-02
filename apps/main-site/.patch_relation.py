import re

schema_path = '/home/apurv_patel/home4stay/apps/main-site/prisma/schema.prisma'

with open(schema_path, 'r') as f:
    content = f.read()

# Add relation to Property
relation_target = """  propertyActivation  PropertyActivation?"""
relation_replace = """  propertyActivation  PropertyActivation?
  mealPlans           PropertyMealPlan[]"""

if "mealPlans           PropertyMealPlan[]" not in content:
    content = content.replace(relation_target, relation_replace)

with open(schema_path, 'w') as f:
    f.write(content)

print("Schema relation updated successfully.")
