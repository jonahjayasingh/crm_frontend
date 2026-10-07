import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Product } from '../../services/api.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  showModal = false;
  formData: Product = { name: '', price: 0, stockQuantity: 0 };

  constructor(private api: ApiService) {}

  ngOnInit() { this.loadProducts(); }
  loadProducts() { this.api.getProducts().subscribe(p => this.products = p); }
  openModal() { this.formData = { name: '', price: 0, stockQuantity: 10 }; this.showModal = true; }
  closeModal() { this.showModal = false; }
  saveProduct() { this.api.createProduct(this.formData).subscribe(() => { this.loadProducts(); this.closeModal(); }); }
  deleteProduct(id: number) { if (confirm('Delete product?')) this.api.deleteProduct(id).subscribe(() => this.loadProducts()); }
}
