import { WorkItemPreviewPanelModule } from './../work-item-preview-panel/work-item-preview-panel.module';
import { LabelsModule } from './../labels/labels.module';
import { AssigneesModule } from './../assignee/assignee.module';
import { WorkItemCellComponent } from './../work-item-cell/work-item-cell.component';
import { NgxDatatableModule } from 'rh-ngx-datatable';
import { NgModule }         from '@angular/core';
import { CommonModule }     from '@angular/common';
import {
  XHRBackend,
  RequestOptions
} from '@angular/http';

import { AuthenticationService } from 'ngx-login-client';

import { PlannerListComponent } from './planner-list.component';

import { HttpService, factoryForHttpService } from '../../services/http-service';
import { CustomQueryService } from './../../services/custom-query.service';
import { WorkItemService } from './../../services/work-item.service';
import { IterationService } from './../../services/iteration.service';
import { GlobalSettings } from './../../shared/globals';
import { LabelService } from './../../services/label.service';
import { AreaService } from './../../services/area.service';
import { CollaboratorService } from './../../services/collaborator.service';
import { PlannerListRoutingModule } from './../planner-list/planner-list-routing.module';
import { ToolbarPanelModule } from './../toolbar-panel/toolbar-panel.module';
import { TooltipConfig, TooltipModule } from 'ngx-bootstrap/tooltip';
import { SidepanelModule } from './../side-panel/side-panel.module';
import {
  PlannerLayoutModule
} from './../../widgets/planner-layout/planner-layout.module';
import { WorkItemQuickAddModule } from './../work-item-quick-add/work-item-quick-add.module';
import { BsDropdownConfig, BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { FilterColumn } from '../../pipes/column-filter.pipe';
import { WorkItemDataService } from './../../services/work-item-data.service';
import { PlannerModalModule } from '../../components/modal/modal.module';
import { TruncateModule } from 'ng2-truncate';

import { CookieService } from './../../services/cookie.service';
import { FilterService } from './../../services/filter.service';

// ngrx stuff
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as states from './../../states/index.state';
import * as reducers from './../../reducers/index.reducer';
import * as effects from './../../effects/index.effects';
import { WorkItemReducer } from './../../reducers/work-item.reducer';

import { AlmIconModule } from 'ngx-widgets';
import { EmptyStateModule } from 'patternfly-ng/empty-state';
import { UrlService } from '../../services/url.service';
import { InfotipService } from '../../services/infotip.service';
import { ClickOutModule } from '../../widgets/clickout/clickout.module';

// Data Querries
import { CommentQuery } from './../../models/comment';
import { UserQuery } from './../../models/user';
import { WorkItemQuery } from './../../models/work-item';
import { LabelQuery } from '../../models/label.model';
import { IterationQuery } from '../../models/iteration.model';
import { AreaQuery } from '../../models/area.model';

let providers = [
    WorkItemService,
    {
      provide: HttpService,
      useFactory: factoryForHttpService,
      deps: [XHRBackend, RequestOptions, AuthenticationService]
    },
    CustomQueryService,
    IterationService,
    TooltipConfig,
    GlobalSettings,
    LabelService,
    AreaService,
    CollaboratorService,
    FilterService,
    BsDropdownConfig,
    CookieService,
    WorkItemDataService,
    UrlService,
    InfotipService,

    CommentQuery,
    UserQuery,
    LabelQuery,
    IterationQuery,
    WorkItemQuery,
    AreaQuery
  ];

@NgModule({
  imports: [
    AlmIconModule,
    AssigneesModule,
    CommonModule,
    ClickOutModule,
    PlannerListRoutingModule,
    PlannerLayoutModule,
    PlannerModalModule,
    EmptyStateModule,
    LabelsModule,
    ToolbarPanelModule,
    TooltipModule.forRoot(),
    SidepanelModule,
    WorkItemQuickAddModule,
    BsDropdownModule.forRoot(),
    NgxDatatableModule,
    WorkItemPreviewPanelModule,
    TruncateModule,
    StoreModule.forFeature('listPage', {
        iterations: reducers.iterationReducer,
        labels: reducers.LabelReducer,
        areas: reducers.AreaReducer,
        collaborators: reducers.CollaboratorReducer,
        customQueries: reducers.CustomQueryReducer,
        groupTypes: reducers.GroupTypeReducer,
        space: reducers.SpaceReducer,
        workItemTypes: reducers.WorkItemTypeReducer,
        workItems: reducers.WorkItemReducer,
        workItemStates: reducers.WorkItemStateReducer,
        infotips: reducers.InfotipReducer,
        users: reducers.UserReducer
      }, {
      initialState: {
        iterations: states.initialIterationState,
        labels: states.initialLabelState,
        areas: states.initialAreaState,
        collaborators: states.initialCollaboratorState,
        customQueries: states.initialCustomQueryState,
        groupTypes: states.initialGroupTypeState,
        space: states.initialSpaceState,
        workItemTypes: states.initialWorkItemTypeState,
        workItems: states.initialWorkItemState,
        workItemStates: states.initialWIState,
        infotips: states.initialInfotipState,
        users: states.inititalUserState
      }
    }),
    EffectsModule.forFeature([
      effects.IterationEffects,
      effects.LabelEffects,
      effects.AreaEffects,
      effects.CollaboratorEffects,
      effects.CustomQueryEffects,
      effects.GroupTypeEffects,
      effects.SpaceEffects,
      effects.WorkItemTypeEffects,
      effects.WorkItemEffects,
      effects.InfotipEffects,
      effects.UserEffects
    ])
  ],
  declarations: [
    PlannerListComponent,
    WorkItemCellComponent,
    FilterColumn
  ],
  providers: providers,
  exports: [ PlannerListComponent ]
})
export class PlannerListModule {
  constructor() {}
}
