import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import {CnpjPipe} from "../shared/pipes/cnpj.pipe"; // Import do Pipe

/**
 * Interface que define a estrutura dos dados de negócio
 * @property name_fantasy - Nome fantasia da empresa
 * @property razao_social - Razão social da empresa
 * @property cnpj? - CNPJ (opcional)
 * @property email? - Email (opcional)
 * @property phone? - Telefone (opcional)
 */
export interface Business {
  name_fantasy: string;
  razao_social: string;
  cnpj?: string;
  email?: string;
  phone?: string;
}

/**
 * Componente para exibir detalhes de uma empresa
 * Seletor: <app-business-details>
 */
@Component({
  selector: 'app-business-details',
  standalone: true, // Componente standalone (Angular 14+)
  templateUrl: './business-details.component.html',
  styleUrls: ['./business-details.component.css'],
  imports: [
    CommonModule, // NgIf, NgFor, etc
    MatButtonModule, // Botões do Material
    MatCardModule, // Card do Material
    MatDividerModule, // Divisor visual
    MatIconModule, // Ícones
    CnpjPipe,
    CnpjPipe,
    // Pipe de formatação
  ]
})
export class BusinessDetailsComponent {
  // Input: Recebe os dados da empresa (pode ser null)
  @Input() business: Business | null = null;

  // Input: Estado de carregamento (exibe spinner quando true)
  @Input() loading: boolean = false;

  // Output: Emite evento quando o usuário clica em editar
  @Output() edit = new EventEmitter<Business>();

  // Controla se os detalhes estão visíveis (inicia fechado)
  showDetails = false;

  /**
   * Método para emitir o evento de edição
   * Verifica se business existe antes de emitir
   */
  editBusiness() {
    if (this.business) {
      this.edit.emit(this.business); // Emite os dados para o componente pai
    }
  }

  /**
   * Alterna a visibilidade dos detalhes
   */
  toggleDetails() {
    this.showDetails = !this.showDetails;
  }
}
