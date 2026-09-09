# -*- coding: utf-8 -*-
import os
import re

filepath = 'apps/main-site/src/app/api/property/room/[roomId]/images/route.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix params for Next.js 15
content = re.sub(
    r'export const POST = withErrorHandler\(async \(request: NextRequest, { params }: { params: { roomId: string } }\) => {',
    r'export const POST = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ roomId: string }> | { roomId: string } }) => {',
    content
)
content = re.sub(
    r'export const GET = withErrorHandler\(async \(request: NextRequest, { params }: { params: { roomId: string } }\) => {',
    r'export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ roomId: string }> | { roomId: string } }) => {',
    content
)
content = content.replace('const { roomId } = params;', 'const { roomId } = await params;')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

filepath = 'apps/main-site/src/app/api/property/room/[roomId]/images/[imageId]/route.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'export const DELETE = withErrorHandler\(async \(request: NextRequest, { params }: { params: { roomId: string, imageId: string } }\) => {',
    r'export const DELETE = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ roomId: string, imageId: string }> | { roomId: string, imageId: string } }) => {',
    content
)
content = content.replace('const { roomId, imageId } = params;', 'const { roomId, imageId } = await params;')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched params in routes")
